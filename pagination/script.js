const input = document.getElementById("input");
const addBtn = document.getElementById("addBtn");
const taskContainer = document.getElementById("taskContainer");
const paginationContainer = document.getElementById("paginationContainer");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

const currentPage = 1;
const perPageTask = 5;

let tasks = JSON.parse(localStorage.getItem("Tasks")) || [];

function saveTask(){
    localStorage.setItem("Tasks",JSON.stringify(tasks));
}

function addTask(){
    let taskText = input.value.trim();

    if(taskText == ""){
        console.log("empty task not allowed")
        return
    }
    
    const task = {
        id:Date.now(),
        value:taskText,
        complete:false
    }

    tasks.unshift(task);
    console.log(tasks)
    saveTask()
    input.value = ""
    input.focus()
}

function renderTask(){
    
}


addBtn.addEventListener("click",addTask)
input.addEventListener("keypress",(e) =>{
    if(e.key === "Enter"){
        addTask()
    }
})

