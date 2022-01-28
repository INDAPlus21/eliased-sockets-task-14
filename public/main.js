console.log("hello socket")

const socket = new WebSocket('ws://localhost:8080');
socket.addEventListener('open', function (event) {
    // socket.send("mymessage");
});

socket.addEventListener('message', function (event) {
    console.log('Message from server ', event.data);
    var message = event.data
    if (message == "is_bot == true") {
        console.log("this is indeed a bot")
        var change_to
        if (guess_is_bot) change_to = "You guessed right"
        else change_to = "You guessed wrong" 
        if (guess_is_bot) document.getElementById("is_bot").innerHTML = change_to
        else {
            document.getElementById("is_human").innerHTML = change_to
            // document.getElementById("is_human").backgroundColor = "red"
        } 
    } else if (message == "is_bot == false") {
        console.log("this is a human")
        var change_to
        if (!guess_is_bot) change_to = "You guessed right"
        else change_to = "You guessed wrong" 
        if (guess_is_bot) document.getElementById("is_human").innerHTML = change_to
        else document.getElementById("is_human").innerHTML = change_to
    } else {
        createMessageElement(message, "ai_message")
    }
});

socket.addEventListener('close', function (event) {
    console.log('The connection has been closed');
});

var guess_is_bot; 

function isBot(is_bot) {
    console.log("time passed: ", timePassed)
    guess_is_bot = is_bot 
    socket.send("isBot(true)")
    // console.log("yes")
}


function createMessageElement(message, class_name) {
    var messages = document.getElementById("messages")
    let received_message = document.createElement("textarea");

    // received_message.value = message
    received_message.value = message

    received_message.className = "message " + class_name
    // received_message.style.overflow = "auto"
    // received_message.style.height = received_message.scrollHeight+'px';
    /*if (textarea.scrollHeight -33 % 19 && (textarea.rows-1)*19+33 != textarea.scrollHeight) {
        received_message.rows += textarea.scrollHeight -33 % 19
    }*/
    /* received_message.rows = Math.floor((textarea.scrollHeight -33) / 19) +1
    console.log(Math.floor((textarea.scrollHeight -33) / 19))
    // received_message.rows = 1 
    console.log(textarea.scrollHeight) */
    // console.log(message.length)
    // received_message.rows = Math.floor(message.length / 45) + 2

    received_message.style.width = "" + ((message.length + 1) * 7) + "px"
    // received_message.style.height = "";
    // received_message.style.height = received_message.scrollHeight + "px"
    received_message.tabIndex = "-1"
    messages.appendChild(received_message)
}

function sendMessage() {
    var text = document.getElementById("main_input").value
    console.log(text.length)
    if (text.length < 3) {
        return
    }
    textarea.value = ""
    textarea.rows = 1

    createMessageElement(text, "my_message")

    socket.send(text.trim().replace(/(\r\n|\n|\r)/gm, ""))
}

var textarea = document.getElementById("main_input");

textarea.oninput = function () {
    console.log(textarea.scrollHeight)
    if ((textarea.scrollHeight - 33 % 19) == 0 && (textarea.rows - 1) * 19 + 33 != textarea.scrollHeight) {
        textarea.rows += 1
    }
    // console.log(textarea.style.height)
    //   textarea.style.height = ""; /* Reset the height*/
    //   textarea.style.height = Math.min(textarea.scrollHeight, heightLimit) + "px";
    //   console.log(textarea.style.height)
    //   textarea.style.height -= 100
    //   console.log(textarea.style.height)
    //   textarea.style.height = textarea.style.height - 100 + "px"
};

// oninput='this.style.height = "";this.style.height = this.scrollHeight + "px"'

const main_input = document.getElementById("main_input")
main_input.addEventListener("keyup", ({ key }) => {
    if (key === "Enter") {
        sendMessage()
    }
})

// Prevent newlines in textarea
constrainInput = (event) => {
    event.target.value = event.target.value.replace(/[\r\n\v]+/g, '')
}

document.querySelectorAll('textarea').forEach(el => {
    el.addEventListener('keyup', constrainInput)
})


// var input = document.querySelector('input'); // get the input element
// input.addEventListener('input', resizeInput); // bind the "resizeInput" callback on "input" event
// resizeInput.call(input); // immediately call the function

// function resizeInput() {
//   this.style.width = this.value.length + "ch";
// }
