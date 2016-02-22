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
    url : string;
    name : string;
    t: string;
    deps : EndpointResponse list
}

let emptyEndpoint = {
    port = 0us;
    url = "";
    name = "";
    t = "";
    deps = [];
}

let listOfServices = [
    ("GG.Web.Crowdfunding", "ms", [
        "GG.Service.IdentityVerification"; "GG.Service.Project"; "GG.Service.Profile"; 
        "GG.Service.Crm"; "GG.Service.User"; "GG.Service.Project.RiskAnalysis";
        "GG.Imaging.Read"; "GG.Imaging.Write"; "GG.Service.Project.Registration"; "GG.Service.AB";
        "PayPal";
     ]);
     ("GG.Service.IdentityVerification", "ms", [
        "VerifyIntegrity"; "Unfido";"CreditCallService";"PayPal";"GG.Service.User"
     ]);
     ("GG.Service.Project", "ms", []);
     ("GG.Service.Profile", "ms", []);
     ("GG.Service.Crm", "ms", []);
     ("GG.Service.User", "ms", []);
     ("GG.Imaging.Read", "ms", []);
     ("GG.Imaging.Write", "ms", []);
     ("GG.Service.Project.Registration", "ms", []);
     ("GG.Service.AB", "ms", []);
     ("PayPal", "external", []);
     ("VerifyIntegrity", "external", []);
     ("Unfido", "external", []);
     ("CreditCallService", "external", []);
     ("GG.Service.User", "ms", []);
     ("BB01", "db", []);
     ("User", "db", []);
     ("Project", "db", []);
     ("GG.Service.Project.RiskAnalysis", "ms", []);
]

//TODO:
// 1. i have a simple array of services with its types and proper servers and endpoint responses are created

let localhost = IPAddress.Parse("127.0.0.1")

let MimeJSON = Writers.setMimeType "application/json"

let toPort port =
    Sockets.Port.Parse(port.ToString());

let createEmptyChildEndpoints list =
    list |> List.fold(fun (array) (s) -> ({ emptyEndpoint with name = s })::array ) []

let fillInEndpoint emptyE fillinE =
    { emptyE with t = fillinE.t; url = (sprintf "http://localhost:%i" fillinE.port); port = fillinE.port }

////todo
////1. go through initial list and fill in deps array
let fillUrlPortInChildEndpoint e list=
    e.deps |> List.map(fun i -> (fillInEndpoint i (List.find(fun x -> x.name = i.name) list)))

let createEndpoints list =
    let startPort = 3000;
    let initialList = list |> List.fold(fun (array, port) (n, t, d) -> ({url = (sprintf "http://localhost:%i" port); port = port |> toPort; name = n; t = t; deps = (createEmptyChildEndpoints d) }::array, port + 1)) ([], startPort) |> fst
    let childrenList = initialList |> List.map(fun i -> { i with deps = (fillUrlPortInChildEndpoint i initialList) })
    childrenList
    

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
                   |> List.fold(fun array e -> (startServer e)::array) []
                   |> List.toArray

    Task.WaitAll(taskList)
    
    printfn "%A" argv
    0 // return an integer exit code
