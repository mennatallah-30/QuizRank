// Get HTML elements
let qsCountHTML = document.getElementById("qsCount");
let qNumber = document.getElementById("qNumber");
let startBtn = document.querySelector("#container #start button");
let cards = document.querySelectorAll("#container .card");
let pages = document.querySelectorAll("#container .page");
let qsTitle = document.querySelector("#question h2");
let choicesContainer = document.querySelector("#question .choices-container");
let rightCountHTML = document.querySelector(".score .number span");
let scoreBar = document.querySelector(".bar .child-bar");
let AllCountHTML = document.querySelector(".score .number .allQ");
let scoreRankHTML = document.querySelector(".score .rank");
let submitBtn = document.getElementById("submitBtn");
let rAnswersPoints = document.getElementById("rAnswersPoints");
let timePoints = document.getElementById("timePoints");
let wrongContainerHTML = document.getElementById("wrongContainer");
let totalResult = document.querySelector(".total-result h2");
let wrongSection = document.getElementById("wrongAnswers");
let nameInput = document.getElementById("nameInput");
let playerName = document.getElementById("playerName");
let timeHTML = document.querySelector("#question .time h1");
let selectedLangImg = document.querySelector("#result .info .left");

// Result
let rightAnswers = 0;
let wrongAnswers = [];

// Switch between app pages function
function switchTo(n = 0) {
  pages.forEach((e) => {
    e.style.transform = `translateX(-${n}px)`;
  });
}
// Change background body function
function changeBgTo(s = "") {
  document.body.style.backgroundImage = `url(./imgs/${s}-bg.png)`;
}

// [ 1 ] ===> Start Page
startBtn.addEventListener("click", (e) => {
  e.preventDefault();
  startBtn.style.marginTop = "0px";
  nameInput.style.opacity = 1;
  nameInput.style.pointerEvents = "auto";
  if (nameInput.value != "") {
    changeBgTo("home");
    switchTo(400);
    // seet player name in final result
    playerName.innerHTML = nameInput.value;
  }
});

// [ 2 ] ===> Home Page
cards.forEach((e) => {
  // MAIN FUNCTION => ENTRY POINT
  e.onclick = () => {
    // get questions from api
    let myReq = new XMLHttpRequest();
    myReq.onreadystatechange = () => {
      if (myReq.readyState === 4 && myReq.status === 200) {
        let qsObj = JSON.parse(myReq.responseText);

        // [ 3 ] ===> Questions Page ====> START
        const qsCount = qsObj.length;
        // time function
        countDown(119, qsCount);
        let indexQs = 0;
        // Add quetions count to html
        qsCountHTML.innerHTML = qsCount;
        AllCountHTML.innerHTML = qsCount;
        // Add question data
        addQuestionData(qsObj[indexQs], indexQs);
        // change to next question
        submitBtn.addEventListener("click", (e) => {
          // disable reload
          e.preventDefault();
          // if exist questions
          if (indexQs < qsCount - 1) {
            // check right answer
            checkAnswer(qsObj[indexQs], indexQs);
            // increase questions counter
            indexQs++;
            // call the next question
            addQuestionData(qsObj[indexQs], indexQs);
          } else {
            // check right answer
            checkAnswer(qsObj[indexQs], indexQs);
            // move to result page
            switchTo(1200);
            // add right answers count
            rightCountHTML.innerHTML = rightAnswers;
            // calc saved seconds
            let timeArr = timeHTML.innerHTML.split(":");
            let savedSeconds = Math.round(timeArr[0] * 60 + timeArr[1]);
            // calc score
            calcScore(rightAnswers, qsCount, savedSeconds);
            // add wrong questions
            addWrongAnswers(wrongAnswers);
          }
        });
        // Change body bg
        changeBgTo("qs");

        // [ 3 ] ===> Questions Page ====> END
      }
    };
    // Get the questions object
    myReq.open("GET", `./json/${e.getAttribute("lang")}.json`, true);
    myReq.send();
    // Switch to questions page
    switchTo(800);
    // set the img in final result
    selectedLangImg.src = `./imgs/${e.getAttribute("lang")} logo.png`;
  };
});

// [ function ] addQuestionData
const addQuestionData = (qs, index) => {
  // add question number
  qNumber.innerHTML = index + 1;

  // add question's title
  qsTitle.innerHTML = qs.title;

  // add question's answers
  choicesContainer.innerHTML = "";
  for (let i = 1; i <= 4; i++) {
    choicesContainer.innerHTML += `
    <div class="choice">
      <input type="radio" name="answer" id="ans${i}">
      <label for="ans${i}">${qs[`answer_${i}`]}</label>
    </div>`;
  }

  // add checked attribute
  choicesContainer.children[0].children[0].checked = true;
};

// [ function ] nextQuestion
const checkAnswer = (qs, index) => {
  // get selected answer & right answer
  let selectedAnswer = document.querySelector(
    '[type="radio"]:checked + label'
  ).innerHTML;
  let rAnswer = qs.right_answer;

  // check if right or not
  if (selectedAnswer == rAnswer) rightAnswers++;
  else wrongAnswers.push(qs);
};

// [ function ] calcScore
const calcScore = (rAnswers, count, savedSeconds = 0) => {
  // add right answers score to html
  rAnswersPoints.innerHTML = rAnswers;
  // custome score bar
  let scorePerc = (rAnswers / count) * 100;
  let scoreTitle = "";
  if (scorePerc <= 25) scoreTitle = "Bad";
  else if (scorePerc > 25 && scorePerc <= 50) scoreTitle = "Not Bad";
  else if (scorePerc > 50 && scorePerc <= 75) scoreTitle = "Good";
  else if (scorePerc > 75 && scorePerc < 100) scoreTitle = "Amazing";
  else scoreTitle = "Perfect";
  // score bar width
  scoreBar.style.width = `${scorePerc}%`;
  // score title
  scoreRankHTML.innerHTML = scoreTitle;
  // calc the saved time
  if (savedSeconds > 20) savedSeconds = 20;
  timePoints.innerHTML = savedSeconds;
  // calc all score
  totalResult.innerHTML = rAnswers + savedSeconds;
};

// [ function ] addWrongAnswers
const addWrongAnswers = (wrArr) => {
  if (wrArr.length) {
    wrongSection.style.display = "block";
  }
  for (let q of wrArr) {
    wrongContainerHTML.innerHTML += `
    <div class="q">${q.title}
      <div class="ans">${q.right_answer}</div>
    </div>`;
  }
};

// [ function ] countDown
const countDown = (duration, count) => {
  let minutes, seconds;
  let countDownInterval = setInterval(() => {
    // parse time
    minutes = parseInt(duration / 60);
    seconds = parseInt(duration % 60);
    // add time to html
    if (seconds > 9) timeHTML.innerHTML = `${minutes}:${seconds}`;
    else timeHTML.innerHTML = `${minutes}:0${seconds}`;
    // time out
    if (--duration < 0) {
      clearInterval(countDownInterval);
      if (pages[0].style.transform != "translateX(-1200px)") {
        // add right answers count
        rightCountHTML.innerHTML = rightAnswers;
        calcScore(rightAnswers, count);
        addWrongAnswers(wrongAnswers);
        switchTo(1200);
      }
    }
  }, 1000);
};
