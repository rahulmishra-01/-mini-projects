
const quizQuestions = [
    {
        question:"Where is Taj Mahal",
        options:["Mumbai","Bihar","Agra","Jaipur"],
        correctAnswer:"Agra"
    },
    {
        question:"What is the capital of India?",
        options:["Kolkata","Uttar Pradesh","New Delhi","Jaipur"],
        correctAnswer:"New Delhi"
    },
    {
        question:"How many oceans are there in the world?",
        options:["8","6","7","5"],
        correctAnswer:"5"
    },
    {
        question:"Which planet is known as the red planet?",
        options:["Earth","Mars","Jupitar","No One"],
        correctAnswer:"Mars"
    },
    {
        question:"In which year did India gain independence?",
        options:["1879","1947","1948","1952"],
        correctAnswer:"1947"
    },

]


const playContianer = document.querySelector(".playContainer");
const quizContainer = document.querySelector(".quizContainer");
const scoreContainer = document.querySelector(".scoreContainer");
const totalQuestion = document.querySelector("#totalQuestionValue");
const totalScore = document.querySelector("#totalScoreValue");
const tryAgainBtn = document.querySelector("#tryAgainBtn")
let currentIndex = 0;
let score = 0;


playContianer.addEventListener("click",() => {
    quizContainer.classList.remove("hide");
    playContianer.classList.add("hide");
})


function loadQuestion(){
    const currentQuestion = quizQuestions[currentIndex];
    const question = document.querySelector(".questionSection p");
    const answerSection = document.querySelector(".answerSection");
    answerSection.innerHTML = " "
    question.textContent = currentQuestion.question;
    currentQuestion.options.forEach((answer) => {
        const answerButton = document.createElement("button");
        answerButton.classList.add("answerBtn");
        answerButton.textContent = answer;
        answerButton.addEventListener("click",() => checkAnswer(answer))
        answerSection.appendChild(answerButton);
    })
}

function checkAnswer(option){
    if(option === quizQuestions[currentIndex].correctAnswer){
        currentIndex++
        score++;

        totalQuestion.textContent = currentIndex;
        totalScore.textContent = score;

        if(currentIndex < quizQuestions.length){
            loadQuestion()
        }else{
            scoreContainer.classList.remove("hide");
            quizContainer.classList.add("hide");
        }
    }else{
        console.log("This answer is wrong")
    }
}

tryAgainBtn.addEventListener("click",() => {
    window.location.reload();
})

loadQuestion()