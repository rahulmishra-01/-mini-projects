const submitGuessBtn = document.querySelector("#submitGuessBtn");
const input = document.querySelector("#inputBox");
const guessContainer = document.querySelector("#previousGuessValue");
const guessValue = [];
const correctAnswer = 85;

submitGuessBtn.addEventListener("click", () => {
  if (input.value === "") {
    console.log("input box is empty");
  }
  console.log(input.value);
  guessValue.push(input.value);
  guessContainer.textContent = guessValue.join(" ");
  input.value = "";
});
