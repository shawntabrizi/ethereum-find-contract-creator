// Check for MetaMask, otherwise use an HTTP Provider
window.addEventListener('load', function () {
    if (typeof web3 !== 'undefined') {
        console.log('Web3 Detected! ' + web3.currentProvider.constructor.name)
        window.web3 = new Web3(web3.currentProvider);
    } else {
        console.log('No Web3 Detected... using HTTP Provider')
        window.web3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/<APIKEY>"));
    }
})

var block_element = document.getElementById("block");
var creator_element = document.getElementById("creator");

async function search_contract_cretion_block(contract_address) {
    var highest_block = await web3.eth.getBlockNumber();
    var lowest_block = 0;

    var contract_code = await web3.eth.getCode(contract_address, highest_block);
    if (contract_code == "0x") {
        console.error("Contract " + contract_address + " does not exist!");
        return -1;
    }

    while (lowest_block <= highest_block) {
        let search_block = parseInt((lowest_block + highest_block) / 2)
        contract_code = await web3.eth.getCode(contract_address, search_block);
        
        //console.log(highest_block, lowest_block, search_block, contract_code);
        
        if (contract_code != "0x") {
            highest_block = search_block;
        } else if (contract_code == "0x") {
            lowest_block = search_block;
        }

        block_element.innerText = search_block;

        if (highest_block == lowest_block + 1) {
            block_element.innerText = highest_block;
            return highest_block;
        }
    }

}

async function search_contract_creator (contract_address, block) {

    var block = await web3.eth.getBlock(block);

    var transactions = block.transactions;

    for (transaction in transactions) {
        let receipt = await web3.eth.getTransactionReceipt(transactions[transaction]);

        //console.log(receipt);
        creator_element.innerText = receipt.from;

        if (receipt.contractAddress == contract_address) {
            return receipt.from
        }
    }

    return -1;
}

async function find_contract_creator (contract_address) {
    var block = await search_contract_cretion_block(contract_address);
    var creator = await search_contract_creator(contract_address, block);
    return [block, creator];
}

async function find_contract_creator_button() {
    block_element.innerText = "Searching...";
    block_element.classList.remove("text-success");
    creator_element.innerText = "Searching...";
    creator_element.classList.remove("text-success");

    var address = document.getElementById("address").value;
    var [block, creator] = await find_contract_creator(address);

    block_element.innerText = block;
    block_element.classList.add("text-success");
    creator_element.innerText = creator;
    creator_element.classList.add("text-success");

}