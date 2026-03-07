let currentCategory = "skin-care";
let currentIndex = 0;
let interval = null;

function getBanners(category) {
  return document.querySelectorAll("video." + category);
}

function showBanner(category, index) {
  const banners = getBanners(category);

  banners.forEach((video, i) => {
    video.classList.remove("active");
    video.pause();
    video.currentTime = 0;

    if (i === index) {
      video.classList.add("active");
      video.play();
    }
  });
}

function startLoop(category) {
  clearInterval(interval);
  const banners = getBanners(category);
  if (!banners.length) return;

  currentIndex = 0;
  showBanner(category, currentIndex);

  interval = setInterval(() => {
    currentIndex = (currentIndex + 1) % banners.length;
    showBanner(category, currentIndex);
  }, 5000);
}

function changeCategory(category) {
  currentCategory = category;

  document.querySelectorAll(".banner-container video").forEach(video => {
    video.classList.remove("active");
    video.pause();
    video.currentTime = 0;
  });

  startLoop(category);

  document.querySelectorAll(".toggle-buttons button").forEach(btn => {
    btn.classList.remove("active-toggle");
    if (btn.dataset.category === category) {
      btn.classList.add("active-toggle");
    }
  });
}

window.addEventListener("DOMContentLoaded", () => {

  document.querySelectorAll(".toggle-buttons button").forEach(btn => {
    btn.addEventListener("click", () => {
      changeCategory(btn.dataset.category);
    });
  });

  // Default Skin Care
  changeCategory("skin-care");
});




// ================= LEVENSHTEIN DISTANCE FUNCTION =================
function levenshteinDistance(a, b) {
  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}


// ================= SMART SEARCH SYSTEM =================
window.addEventListener("DOMContentLoaded", function () {

  const searchInput = document.getElementById("searchInput");
  const searchBtn = document.getElementById("searchBtn");

  function smartSearch() {

    const searchValue = searchInput.value.toLowerCase().trim();
    if (searchValue === "") return;

    const searchWords = searchValue
      .split(" ")
      .filter(word => word.length > 2); // ignore very small words

    const products = document.querySelectorAll(".product");

    let exactMatches = [];
    let allWordMatches = [];
    let fuzzyMatches = [];

    // Remove previous highlights
    products.forEach(product => {
      product.classList.remove("highlight");
    });

    products.forEach(product => {

      const productName = product.querySelector("p").innerText.toLowerCase();
      const productWords = productName.split(" ");

      // ================= 1️⃣ EXACT FULL PHRASE =================
      if (productName.includes(searchValue)) {
        exactMatches.push(product);
        return;
      }

      // ================= 2️⃣ ALL WORDS MATCH =================
      const allMatch = searchWords.length > 0 &&
        searchWords.every(word => productName.includes(word));

      if (allMatch) {
        allWordMatches.push(product);
        return;
      }

      // ================= 3️⃣ FUZZY MATCH =================
      let fuzzyScore = 0;

      searchWords.forEach(searchWord => {

        if (searchWord.length < 4) return;

        productWords.forEach(productWord => {

          if (productWord.length < 4) return;

          const distance = levenshteinDistance(searchWord, productWord);

          const similarity =
            1 - (distance / Math.max(searchWord.length, productWord.length));

          // Only strong similarity allowed
          if (similarity > 0.8) {
            fuzzyScore++;
          }

        });

      });

      if (fuzzyScore > 0) {
        fuzzyMatches.push(product);
      }

    });

    // ================= PRIORITY SELECTION =================
    let finalResults = [];

    if (exactMatches.length > 0) {
      finalResults = exactMatches;
    } else if (allWordMatches.length > 0) {
      finalResults = allWordMatches;
    } else {
      fuzzyMatches.sort((a, b) => 0); // simple fallback
      finalResults = fuzzyMatches;
    }

    // ================= SHOW RESULTS =================
    if (finalResults.length > 0) {

      finalResults.forEach(product => {

        product.classList.add("highlight");

        // Remove highlight after 3 seconds
        setTimeout(() => {
          product.classList.remove("highlight");
        }, 3000);

      });

      finalResults[0].scrollIntoView({
        behavior: "smooth",
        block: "center"
      });

    } else {
      alert("Product not found");
    }

  }

  searchBtn.addEventListener("click", smartSearch);

  searchInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      smartSearch();
    }
  });

});
