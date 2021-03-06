package main

import "fmt"
import "encoding/json"
import "time"
import "bytes"

//import "strconv"
import "github.com/hyperledger/fabric/core/chaincode/shim"
import sc "github.com/hyperledger/fabric/protos/peer"

type SmartContract struct {
}

const (
	Estandar      = 1
	Amplia        = 2
	Personalizada = 3
)

/*
* predefined layouts for use in Time.Format and Time.Parse
* see https://golang.org/pkg/time/#pkg-constants
 */
const dateFormat = "2006-01-02"

type Tipo int

type Cliente struct {
	Nombre          string `json:"nombre"`
	ApellidoPaterno string `json:"apellidoPaterno"`
	ApellidoMaterno string `json:"apellidoMaterno"`
	Telefono        string `json:"telefono"`
	Correo          string `json:"correo"`
}

type Aseguradora struct {
	IdAseguradora string `json:"idAseguradora"`
	Nombre        string `json:"nombre"`
}

type Automovil struct {
	Placa string `json:"placa"`
	Vin   string `json:"vin"`
}

type Poliza struct {
	Id          string      `json:"id"`
	Aseguradora Aseguradora `json:"aseguradora"`
	Cliente     Cliente     `json:"cliente"`
	Automovil   Automovil   `json:"automovil"`
	FechaIni    time.Time   `json:"fechaIni"`
	FechaFin    time.Time   `json:"fechaFin"`
	Tipo        Tipo        `json:"tipo"`
	Estatus     bool        `json:"estatus"`
}

type Car struct {
	Make   string `json:"make"`
	Model  string `json:"model"`
	Colour string `json:"colour"`
	Owner  string `json:"owner"`
}

/*
 * The Init method is called when the Smart Contract "fabcar" is instantiated by the blockchain network
 * Best practice is to have any Ledger initialization in separate function -- see initLedger()
 */
func (s *SmartContract) Init(APIstub shim.ChaincodeStubInterface) sc.Response {
	return shim.Success(nil)
}

func (s *SmartContract) initLedger(APIstub shim.ChaincodeStubInterface) sc.Response {

	var polizas [2]Poliza
	polizas[0].Cliente.Nombre = "guillermo"
	polizas[0].Cliente.ApellidoPaterno = "portillo"
	polizas[0].Cliente.ApellidoMaterno = "flores"
	polizas[0].Automovil.Placa = "ABC123"
	polizas[0].Automovil.Vin = "h0l4mund0"
	polizas[0].Aseguradora.Nombre = "AXXA"
	polizas[0].Aseguradora.IdAseguradora = "aseg01"
	polizas[0].FechaIni, _ = time.Parse(dateFormat, "2015-01-30")
	polizas[0].FechaFin, _ = time.Parse(dateFormat, "2016-06-01")
	polizas[0].Id = "1"

	polizas[1].Cliente.Nombre = "qwer"
	polizas[1].Cliente.ApellidoPaterno = "asdf"
	polizas[1].Cliente.ApellidoMaterno = "zxcv"
	polizas[1].Automovil.Placa = "DEF456"
	polizas[1].Automovil.Vin = "h0l4mund0"
	polizas[1].Aseguradora.Nombre = "AXXA"
	polizas[1].Aseguradora.IdAseguradora = "aseg01"
	polizas[1].FechaIni, _ = time.Parse(dateFormat, "2015-01-30")
	polizas[1].FechaFin, _ = time.Parse(dateFormat, "2016-06-01")
	polizas[1].Id = "2"

	i := 0
	for i < len(polizas) {
		fmt.Println("i is ", i)
		polizasAsBytes, err := json.Marshal(polizas[i])
		if err != nil {
			fmt.Println("error: ", err)
		}
		APIstub.PutState(polizas[i].Id, polizasAsBytes)
		fmt.Println("Added", polizas[i])
		i = i + 1
	}

	return shim.Success(nil)
}

func (s *SmartContract) polizaPorId(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	carAsBytes, _ := APIstub.GetState(args[0])
	return shim.Success(carAsBytes)
}

func (s *SmartContract) polizasPorAseguradora(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	startKey := "0"
	endKey := "999"

	resultsIterator, err := APIstub.GetStateByRange(startKey, endKey)
	if err != nil {
		return shim.Error(err.Error())
	}
	defer resultsIterator.Close()

	// buffer is a JSON array containing QueryResults
	var buffer bytes.Buffer
	var pol Poliza
	buffer.WriteString("[")

	bArrayMemberAlreadyWritten := false

	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}
		json.Unmarshal(queryResponse.Value, &pol)
		if pol.Aseguradora.Nombre == args[0] {
			// Add a comma before array members, suppress it for the first array member
			if bArrayMemberAlreadyWritten == true {
				buffer.WriteString(",")
			}
			buffer.WriteString("{\"Key\":")
			buffer.WriteString("\"")
			buffer.WriteString(queryResponse.Key)
			buffer.WriteString("\"")

			buffer.WriteString(", \"Record\":")
			// Record is a JSON object, so we write as-is
			buffer.WriteString(string(queryResponse.Value))
			buffer.WriteString("}")
			bArrayMemberAlreadyWritten = true
		}
	}

	buffer.WriteString("]")

	fmt.Printf("- queryAllCars:\n%s\n", buffer.String())

	return shim.Success(buffer.Bytes())
}

func (s *SmartContract) todasPolizas(APIstub shim.ChaincodeStubInterface) sc.Response {

	startKey := "0"
	endKey := "999"

	resultsIterator, err := APIstub.GetStateByRange(startKey, endKey)
	if err != nil {
		return shim.Error(err.Error())
	}
	defer resultsIterator.Close()

	// buffer is a JSON array containing QueryResults
	var buffer bytes.Buffer
	buffer.WriteString("[")

	bArrayMemberAlreadyWritten := false
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()

		fmt.Println(queryResponse.Key)
		fmt.Println(queryResponse.Value)

		if err != nil {
			return shim.Error(err.Error())
		}
		// Add a comma before array members, suppress it for the first array member
		if bArrayMemberAlreadyWritten == true {
			buffer.WriteString(",")
		}
		buffer.WriteString("{\"Key\":")
		buffer.WriteString("\"")
		buffer.WriteString(queryResponse.Key)
		buffer.WriteString("\"")

		buffer.WriteString(", \"Record\":")
		// Record is a JSON object, so we write as-is
		buffer.WriteString(string(queryResponse.Value))
		buffer.WriteString("}")
		bArrayMemberAlreadyWritten = true
	}
	buffer.WriteString("]")

	fmt.Printf("- queryAllCars:\n%s\n", buffer.String())

	return shim.Success(buffer.Bytes())
}

func (s *SmartContract) createPoliza(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	var poliza Poliza
	json.Unmarshal([]byte(args[0]), &poliza)
	polizaAsBytes, _ := json.Marshal(poliza)
	APIstub.PutState(poliza.Id, polizaAsBytes)

	return shim.Success(nil)
}

func (s *SmartContract) changeInfoPoliza(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments. Expecting 2")
	}

	var poliza Poliza
	json.Unmarshal([]byte(args[1]), &poliza)
	polizaAsBytes, _ := json.Marshal(poliza)
	APIstub.PutState(args[0], polizaAsBytes)

	return shim.Success(nil)
}

/*
 * The Invoke method is called as a result of an application request to run the Smart Contract "fabcar"
 * The calling application program has also specified the particular smart contract function to be called, with arguments
 */

func (s *SmartContract) Invoke(APIstub shim.ChaincodeStubInterface) sc.Response {

	// Retrieve the requested Smart Contract function and arguments
	function, args := APIstub.GetFunctionAndParameters()
	// Route to the appropriate handler function to interact with the ledger appropriately
	if function == "polizaPorId" {
		return s.polizaPorId(APIstub, args)
	} else if function == "initLedger" {
		return s.initLedger(APIstub)
	} else if function == "createPoliza" {
		return s.createPoliza(APIstub, args)
	} else if function == "todasPolizas" {
		return s.todasPolizas(APIstub)
	} else if function == "changeInfoPoliza" {
		return s.changeInfoPoliza(APIstub, args)
	} else if function == "polizasPorAseguradora" {
		return s.polizasPorAseguradora(APIstub, args)
	}

	return shim.Error("Invalid Smart Contract function name.")
}

// The main function is only relevant in unit test mode. Only included here for completeness.
func main() {

	// Create a new Smart Contract
	err := shim.Start(new(SmartContract))
	if err != nil {
		fmt.Printf("Error creating new Smart Contract: %s", err)
	}
}
