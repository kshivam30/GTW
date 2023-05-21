const inputs = document.querySelector(".inputs"),
hintTag = document.querySelector(".hint span"),
guessLeft = document.querySelector(".guess-left span"),
wrongLetter = document.querySelector(".wrong-letter span"),
resetBtn = document.querySelector(".reset-btn"),
typingInput = document.querySelector(".typing-input");

let word, maxGuesses, incorrectLetters = [], correctLetters = [];


function randomWord() {
    let ranItem = wordList[Math.floor(Math.random() * wordList.length)];
    console.log(ranItem);
    word = ranItem.word;
    maxGuesses = word.length >= 5 ? 8 : 6;
    correctLetters = []; incorrectLetters = [];
    hintTag.innerText = ranItem.hint;
    guessLeft.innerText = maxGuesses;
    wrongLetter.innerText = incorrectLetters;

    let html = "";
    for (let i = 0; i < word.length; i++) {
        html += `<input type="text" disabled>`;
        inputs.innerHTML = html;
    }
}
randomWord();

function initGame(e) {
    let key = e.target.value.toLowerCase();
    if(key.match(/^[A-Za-z]+$/) && !incorrectLetters.includes(` ${key}`) && !correctLetters.includes(key)) {
        if(word.includes(key)) {
            for (let i = 0; i < word.length; i++) {
                if(word[i] == key) {
                    correctLetters += key;
                    inputs.querySelectorAll("input")[i].value = key;
                }
            }
        } else {
            maxGuesses--;
            incorrectLetters.push(` ${key}`);
        }
        guessLeft.innerText = maxGuesses;
        wrongLetter.innerText = incorrectLetters;
    }
    typingInput.value = "";

    setTimeout(() => {
        if(correctLetters.length === word.length) {
            alert(`Congrats! You found the word ${word.toUpperCase()}`);
            update(1);
            reset();
            return randomWord();
        } else if(maxGuesses < 1) {
            alert("Game over! You don't have remaining guesses");
            update(-1);
            reset();
            for(let i = 0; i < word.length; i++) {
                inputs.querySelectorAll("input")[i].value = word[i];
            }
        }
    }, 100);
}

async function update(result) {
    var time=returnData(minute)+":"+returnData(second);
    const response = await fetch("http://localhost:80/update", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            result: result,
            time: time
        })
    });
    const data = await response.json();
}

resetBtn.addEventListener("click", randomWord);
inputs.addEventListener("click", () => typingInput.focus());
document.addEventListener("keydown", () => typingInput.focus());


// let hour = 0;
let minute = 0;
let second = 0;
// let millisecond = 0;

let cron;

document.form_main.start.onclick = () => {
    start();
}

function start() {
    typingInput.addEventListener("input", initGame);
    reset();
    cron = setInterval(() => { timer(); }, 1000);
}

function reset() {
    // hour = 0;
    minute = 0;
    second = 0;
    // millisecond = 0;
    // document.getElementById('hour').innerText = '00';
    document.getElementById('minute').innerText = '00';
    document.getElementById('second').innerText = '00';
    // document.getElementById('millisecond').innerText = '000';
    
    clearInterval(cron);
}

function timer() {
    // if ((millisecond += 10) == 1000) {
    //   millisecond = 0;
    //   second++;
    // }
    second++;
    if (second == 60) {
      second = 0;
      minute++;
    }

    if (minute == 60) {
      minute = 0;;
    }
    // document.getElementById('hour').innerText = returnData(hour);
    document.getElementById('minute').innerText = returnData(minute);
    document.getElementById('second').innerText = returnData(second);
    // document.getElementById('millisecond').innerText = returnData(millisecond);
  }
  
  function returnData(input) {
    return input >= 10 ? input : `0${input}`
  }