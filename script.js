let processedSeeds = new Set(); // Track already processed seeds

async function generateAndCheckSeed() {
  const numSeeds = parseInt(document.getElementById("num-seeds").value);
  const seedResultsContainer = document.getElementById("seed-results");
  const progressStatus = document.getElementById("progress-status");

  seedResultsContainer.innerHTML = ""; // Clear previous results
  progressStatus.textContent = `Progress: 0/${numSeeds}`;

  const seedsToGenerate = [];
  let generatedSeeds = 0;

  // Generate unique seeds
  while (generatedSeeds < numSeeds) {
    const randomMnemonic = ethers.utils.entropyToMnemonic(ethers.utils.randomBytes(16));

    // Ensure no duplicate seed
    if (!processedSeeds.has(randomMnemonic)) {
      processedSeeds.add(randomMnemonic);
      seedsToGenerate.push(randomMnemonic);
      generatedSeeds++;
    }

    // Update progress every 5 seeds generated
    if (generatedSeeds % 5 === 0) {
      progressStatus.textContent = `Progress: ${generatedSeeds}/${numSeeds}`;
    }
  }

  // Fetch and check wallets concurrently
  const walletPromises = seedsToGenerate.map(seed => checkWallet(seed));
  const walletResults = await Promise.all(walletPromises);

  // Append results after all have been processed
  walletResults.forEach(result => seedResultsContainer.appendChild(result));

  // Final progress update
  progressStatus.textContent = `Progress: ${numSeeds}/${numSeeds}`;
}

async function checkWallet(seed) {
  const wallet = ethers.Wallet.fromMnemonic(seed);
  const address = wallet.address;

  // Fetch balances concurrently
  const [eth, bnb] = await Promise.all([getETHBalance(address), getBSCBalance(address)]);

  const walletInfo = document.createElement("div");
  walletInfo.classList.add("wallet-info");

  // Add Address and Seed Phrase to wallet info
  walletInfo.innerHTML = `
    <p>Address: ${address}</p>
    <p>Seed Phrase: ${seed}</p>
    <p>ETH Balance: ${eth} ETH</p>
    <p>BNB Balance: ${bnb} BNB</p>
  `;

  // Check if wallet has balance, and apply appropriate class
  if (parseFloat(eth) > 0 || parseFloat(bnb) > 0) {
    walletInfo.classList.add("has-balance");
  } else {
    walletInfo.classList.add("no-balance");
  }

  return walletInfo;
}

// Fungsi untuk mendapatkan saldo ETH dari Infura
async function getETHBalance(address) {
  // Ganti 'YOUR_INFURA_KEY' dengan kunci API Anda untuk Ethereum (contoh: Infura)
  const provider = new ethers.JsonRpcProvider("https://mainnet.infura.io/v3/d3011414c0114807911c1b6cea9d79f4");
  const balance = await provider.getBalance(address);
  return ethers.utils.formatEther(balance);
}

// Fungsi untuk mendapatkan saldo BNB dari BSC
async function getBSCBalance(address) {
  // Ganti 'YOUR_BSC_API_KEY' dengan kunci API Anda untuk BSC (contoh: BSC RPC API)
  const provider = new ethers.JsonRpcProvider("https://bsc-dataseed.binance.org/7TE7WEGMD443RZJ9I1BDHVEFB5FEIKD6W9");
  const balance = await provider.getBalance(address);
  return ethers.utils.formatEther(balance);
}
