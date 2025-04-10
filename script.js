const INFURA_API_KEY = "d3011414c0114807911c1b6cea9d79f4"; // Ganti dengan API key Infura untuk Ethereum
const BSC_API_KEY = "7TE7WEGMD443RZJ9I1BDHVEFB5FEIKD6W9"; // Ganti dengan API key untuk BSC

// Menyimpan seed yang sudah diproses
const processedSeeds = new Set();

async function generateAndCheckSeed() {
  const numSeeds = parseInt(document.getElementById("num-seeds").value); // Mendapatkan jumlah seed yang diinginkan
  const seedResultsContainer = document.getElementById("seed-results");
  seedResultsContainer.innerHTML = ""; // Clear previous results

  console.log(`Generating ${numSeeds} seed phrases...`); // Debugging log

  let generatedSeeds = 0;

  while (generatedSeeds < numSeeds) {
    const randomMnemonic = ethers.utils.entropyToMnemonic(ethers.utils.randomBytes(16));

    console.log(`Generated seed: ${randomMnemonic}`); // Debugging log

    if (processedSeeds.has(randomMnemonic)) {
      console.log(`Seed already processed: ${randomMnemonic}`); // Jika seed sudah ada, log
      continue; // Lewati seed yang sudah ada
    }

    processedSeeds.add(randomMnemonic);

    // Menambahkan log saat wallet sedang diperiksa
    console.log(`Checking wallet for seed: ${randomMnemonic}`);
    await checkWallet(randomMnemonic, seedResultsContainer);

    generatedSeeds++;
  }
}

async function getAddressFromSeed(seed) {
  const { ethers } = window.ethers;
  const wallet = ethers.Wallet.fromMnemonic(seed);
  console.log(`Wallet Address: ${wallet.address}`); // Log alamat wallet yang dihasilkan
  return wallet;
}

async function getETHBalance(address) {
  const provider = new ethers.providers.InfuraProvider("mainnet", INFURA_API_KEY);
  const balance = await provider.getBalance(address);
  console.log(`ETH Balance for ${address}: ${ethers.utils.formatEther(balance)} ETH`); // Log saldo ETH
  return ethers.utils.formatEther(balance);
}

async function getBSCBalance(address) {
  const provider = new ethers.providers.JsonRpcProvider(`https://bsc-dataseed.binance.org/`);
  const balance = await provider.getBalance(address);
  console.log(`BNB Balance for ${address}: ${ethers.utils.formatEther(balance)} BNB`); // Log saldo BNB
  return ethers.utils.formatEther(balance);
}

async function getERC20Tokens(address, isBSC = false) {
  const tokens = [
    { symbol: "USDT", address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", decimals: 6 }, // USDT on Ethereum
    { symbol: "DAI",  address: "0x6B175474E89094C44Da98b954EedeAC495271d0F", decimals: 18 }  // DAI on Ethereum
  ];

  const abi = ["function balanceOf(address) view returns (uint256)"];
  const provider = isBSC 
    ? new ethers.providers.JsonRpcProvider(`https://bsc-dataseed.binance.org/`) // BSC
    : new ethers.providers.InfuraProvider("mainnet", INFURA_API_KEY); // Ethereum
  
  const results = [];

  for (const token of tokens) {
    const contract = new ethers.Contract(token.address, abi, provider);
    const bal = await contract.balanceOf(address);

    // Menambahkan log untuk melihat saldo token yang didapat
    console.log(`Token: ${token.symbol}, Address: ${address}, Balance: ${bal.toString()}`);

    const formatted = ethers.utils.formatUnits(bal, token.decimals);
    results.push({ symbol: token.symbol, balance: formatted });
  }

  return results;
}

async function checkWallet(seed, seedResultsContainer) {
  console.log(`Checking wallet for seed: ${seed}`); // Log seed yang sedang diperiksa

  const wallet = await getAddressFromSeed(seed);
  const address = wallet.address;

  console.log(`Wallet address: ${address}`); // Log alamat wallet yang dihasilkan dari seed

  const eth = await getETHBalance(address);
  const bnb = await getBSCBalance(address);
  const tokens = await getERC20Tokens(wallet.address);

  console.log(`ETH Balance: ${eth}, BNB Balance: ${bnb}`); // Log saldo ETH dan BNB

  const walletInfo = document.createElement("div");
  walletInfo.classList.add("wallet-info");

  const addressElem = document.createElement("p");
  addressElem.textContent = `Address: ${address}`;
  walletInfo.appendChild(addressElem);

  const ethElem = document.createElement("p");
  ethElem.textContent = `ETH Balance: ${eth} ETH`;
  walletInfo.appendChild(ethElem);

  const bnbElem = document.createElement("p");
  bnbElem.textContent = `BNB Balance: ${bnb} BNB`;
  walletInfo.appendChild(bnbElem);

  const tokenList = document.createElement("ul");
  tokens.forEach(t => {
    if (parseFloat(t.balance) > 0) {
      const li = document.createElement("li");
      li.textContent = `${t.balance} ${t.symbol}`;
      tokenList.appendChild(li);
    }
  });
  walletInfo.appendChild(tokenList);

  // Menyembunyikan hasil setelah beberapa detik
  if (parseFloat(eth) > 0 || parseFloat(bnb) > 0 || tokens.some(t => parseFloat(t.balance) > 0)) {
    console.log(`Wallet has balance: ${eth} ETH, ${bnb} BNB`); // Log jika wallet memiliki saldo

    seedResultsContainer.appendChild(walletInfo);

    setTimeout(() => {
      seedResultsContainer.removeChild(walletInfo);
    }, 5000); // Menghilang setelah 5 detik
  }
}
