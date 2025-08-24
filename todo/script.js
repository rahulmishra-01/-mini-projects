const input = document.getElementById("addTaskInput");
const addBtn = document.getElementById("addTaskBtn");

addBtn.addEventListener("click",() => {
  console.log(input.value)
  input.value = ""
})