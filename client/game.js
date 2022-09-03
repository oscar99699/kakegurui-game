const selectors = {
    boardContainer: document.querySelector('.board-container'),
    board: document.querySelector('.board'),
    win: document.querySelector('.win'),
    turn : document.querySelector('#turn')
}

const emojis = ['🥔', '🍒', '🥑', '🌽', '🥕', '🍇', '🍉', '🍌']

const state = {
    flippedCards: 0,
    myTurn : false
}

const generateGame = () => {
    const dimensions = selectors.board.getAttribute('data-dimension')

    var items = [...Array(emojis.length).keys(), ...Array(emojis.length).keys()]

    const cards = `
        <div class="board" style="grid-template-columns: repeat(${dimensions}, auto)">
            ${items.map((item,index)  => `
                <div class="card" data-index="${index}">
                    <div class="card-front"></div>
                    <div class="card-back"></div>
                </div>
            `).join('')}
       </div>
    `
    
    const parser = new DOMParser().parseFromString(cards, 'text/html')

    selectors.board.replaceWith(parser.querySelector('.board'))
}

const flipBackCards = () => {
    document.querySelectorAll('.card:not(.matched)').forEach(card => {
        card.classList.remove('flipped')
    })

    state.flippedCards = 0
}

const attachEventListeners = () => {
    document.addEventListener('click', event => {
        const eventTarget = event.target
        const eventParent = eventTarget.parentElement

        if (eventTarget.className.includes('card') && !eventParent.className.includes('flipped')) {
            if(state.myTurn && state.flippedCards<=2){
                socketGame.flipCard(eventParent.getAttribute('data-index'))
            }
        }
    })
}

function switchMyTurn(data){
    state.myTurn = data.myTurn
    selectors.turn.innerHTML = `<h1>${state.myTurn? 'Your turn, pick 2 cards' : 'Wait For your turn !'} </h1>`
}

socketGame.startGame((data) => {
    selectors.board.innerHTML = "Game is about to start, get ready!!!!"
    switchMyTurn(data);

    setTimeout(()=>{

        generateGame();
        attachEventListeners();

    },3000)
})

socketGame.flipCardServer(data => {
    state.flippedCards++;
    const card = document.querySelectorAll('.board > .card')[data.cardIndex];
    card.classList.add('flipped');
    card.querySelector('.card-back').innerHTML = emojis[data.serverCardIndex];
    

    if (state.flippedCards === 2) {
        const flippedCards = document.querySelectorAll('.flipped:not(.matched)')

        if (flippedCards[0].innerText === flippedCards[1].innerText) {
            flippedCards[0].classList.add('matched')
            flippedCards[1].classList.add('matched')
        }

        if(state.myTurn){
            socketGame.checkMatch({
                card1 : flippedCards[0].getAttribute('data-index'),
                card2 : flippedCards[1].getAttribute('data-index')
            })
        }

        setTimeout(() => {
            flipBackCards()
        }, 1000)
    }

})

socketGame.checkMatchServer(data => {

    switchMyTurn(data);
    if(data.gameOver){

        selectors.turn.innerHTML = `<h1>Game Over</h1>`

        setTimeout(() => {
            selectors.boardContainer.classList.add('flipped')
            selectors.win.innerHTML = `
                <span class="win-text">
                    ${data.winner? 'You Have won' : 'You have lost '} <br>
                    with <span class="highlight">${data.myStats.matches.length}</span> matches <br />
                    
                    <span class="highlight">
                        ${data.myStats.matches.map(item => `${emojis[item]}`)}
                    </span>
                </span>
            `
        }, 1000)

    }

})
