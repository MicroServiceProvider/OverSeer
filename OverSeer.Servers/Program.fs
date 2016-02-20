// Learn more about F# at http://fsharp.org
// See the 'F# Tutorial' project for more help.

open Suave
open Suave.Json
open Suave.Utils
open Suave.Http
open Suave.Files
open Suave.Filters
open Suave.Operators
open Suave.Control
open Suave.Successful
open Suave.Redirection
open Suave.RequestErrors
open Suave.WebPart
open System.Net
open System.Threading
open System
open System.Threading.Tasks
open Newtonsoft.Json

type EndpointResponse = {
    port : uint16;
    name : string;
    t: string;
    deps : string list
}

let listOfServices = [
    ("GG.Web.Crowdfunding", "ms", [
        "GG.Service.IdentityVerification"; "GG.Service.Project"; "GG.Service.Profile"; 
        "GG.Service.Crm.ExactTarget"; "GG.Service.User"; "GG.Service.Project.RiskAnalysis";
        "GG.Imaging.Read"; "GG.Imaging.Write"; "GG.Service.Project.Registration"; "GG.Service.AB";
        "PayPal";
     ]);
     ("GG.Service.IdentityVerification", "ms", []);
     ("GG.Service.Project", "ms", []);
     ("GG.Service.Profile", "ms", []);
     ("GG.Service.Crm.ExactTarget", "ms", []);
     ("GG.Service.User", "ms", []);
     ("GG.Imaging.Read", "ms", []);
     ("GG.Imaging.Write", "ms", []);
     ("GG.Service.Project.Registration", "ms", []);
     ("GG.Service.AB", "ms", []);
     ("PayPal", "external", []);
     ("BB01", "db", []);
     ("User", "db", []);
     ("Project", "db", []);
     ("GG.Service.IdentityVerification", "ms", []);
]

//TODO:
// 1. I have a simple function that lets me spawn a server with a proper json format
//  - i can specify port number for dependancies

let localhost = IPAddress.Parse("127.0.0.1")

let MimeJSON = Writers.setMimeType "application/json"

let toPort port =
    Sockets.Port.Parse(port.ToString());

let createEndpoints list =
    let startPort = 3000;
    list 
    |> List.fold(fun (array, port) (n, t, d) -> ({port = port |> toPort; name = n; t = t; deps = d }::array, port + 1)) ([], startPort)
    

let app endpoint =
    choose 
        [ GET >=> choose
            [ path "/status/health" >=> MimeJSON >=> OK (JsonConvert.SerializeObject(endpoint));
              path "/" >=> Redirection.redirect "/status/health" ]
        ]

[<EntryPoint>]
let main argv = 
    let serverConfig port =
        { defaultConfig with bindings = [HttpBinding.mk Protocol.HTTP localhost port] }

    let startServer endpoint =
        Task.Run(fun () -> startWebServer (serverConfig endpoint.port) (app endpoint))

    let taskList = listOfServices 
                   |> createEndpoints
                   |> fst
                   |> List.fold(fun array e -> (startServer e)::array) []
                   |> List.toArray

    Task.WaitAll(taskList)
    
    printfn "%A" argv
    0 // return an integer exit code
