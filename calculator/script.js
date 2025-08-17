const themeBtn = document.getElementById("themeBtn");
const themeIcon = document.querySelector("#themeBtn i");
const button = document.querySelectorAll("button");
const inputBox = document.querySelector(".inputContainer input");
let themeMode = localStorage.getItem("Theme") || "dark";

button.forEach((el) => {
    el.addEventListener("click",(e) => {
        let text = e.target.value;
        if(e.target.value === "="){
            inputBox.value = eval(inputBox.value);
        }
        else if(e.target.value === "c"){
            inputBox.value = "";
        }
        else{
            inputBox.value += text;
        }
    })
})

function applyTheme(){
    if(themeMode == "light"){
        document.body.classList.remove("dark");
        themeIcon.classList.add("fa-sun");
        themeIcon.classList.remove("fa-moon");
    }else{
        document.body.classList.add("dark");
        themeIcon.classList.add("fa-moon");
        themeIcon.classList.remove("fa-sun");
    }
}

themeBtn.addEventListener("click",() => {
    themeMode = themeMode == "light" ? "dark" : "light";
    localStorage.setItem("Theme",themeMode);
    applyTheme();
})

applyTheme();