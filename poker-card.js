const GAME_STATE = {
  FirstCardAwaits: "FirstCardAwaits",
  SecondCardAwaits: "SecondCardAwaits",
  CardsMatchFailed: "CardsMatchFailed",
  CardsMatched: "CardsMatched",
  GameFinished: "GameFinished",
}

const symbols = [
  'https://image.flaticon.com/icons/svg/105/105223.svg',
  'https://image.flaticon.com/icons/svg/105/105220.svg',
  'https://image.flaticon.com/icons/svg/105/105212.svg',
  'https://image.flaticon.com/icons/svg/105/105219.svg'
]

const utility = {
  getRandomNumberArray(count) {
    const number = Array.from(Array(count).keys())
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1));[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
    return number
  }
}

const view = {
  getCardcontent (index){
    const number  = this.transformNumber (index%13+1)
    const symbol = symbols[Math.floor(index/13)]
    return `
      <p>${number}</p>
      <img src=${symbol} alt="">
      <p>${number}</p>`
  },
  getCardElement (index){
    return `<div class ='card back' data-id= '${index}'></div>`
  },
  transformNumber(number){
    switch (number){
      case 1: 
       return 'A'
      case 11: 
       return 'J'
      case 12: 
       return 'Q'
      case 13:
       return 'K'
      default:
        return number
      }
  },
  displayCards(array) {
    const cards = document.querySelector('#cards')
    cards.innerHTML = array.map (index => this.getCardElement(index)).join('')
  },
  flipCards (...cards){
    //背面轉正
    cards.map( card => {
      if (card.classList.contains('back')) {
      card.innerHTML = this.getCardcontent(card.dataset.id)
      card.classList.remove('back')
      return
    }
      card.classList.add('back')
      card.innerHTML = ''  
   })
  },
  renderMatchedCards (...cards){
    cards.map (card => {
     card.classList.add('paired')
    })
  },
  renderScore() {
    document.querySelector('#score').innerText = `score:${model.score}`
  },
  renderTriedTimes() {
    document.querySelector ('#times').innerText = `Tried Times: ${model.triedTimes}`
  },
  appendWrongAnimation(...cards) {
    cards.map(card => {
      card.classList.add('wrong')
      card.addEventListener('animationend', event => {event.target.classList.remove('wrong')}, { once: true })
    })
  },
  showGameFinished() {
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
      <p>Complete!</p>
      <p>Score: ${model.score}</p>
      <p>You've tried: ${model.triedTimes} times</p>
    `
    const header = document.querySelector('#header')
    header.before(div)
  }
}


const model = {
  revealedCards : [],
  isRevealedCardMatched (){
    const firstCardNumber = Number(this.revealedCards[0].dataset.id)
    const secondCardNumber = Number(this.revealedCards[1].dataset.id)
    return (firstCardNumber - secondCardNumber) % 13 === 0
  },
  score : 0,
  triedTimes : 0,
}

const controller = {
  currentState: GAME_STATE.FirstCardAwaits,
  generateCards (){
    view.displayCards(utility.getRandomNumberArray(52))
  },
  resetCards() {
    console.log (model.revealedCards)
    view.flipCards(...model.revealedCards)
    model.revealedCards = []
    controller.currentState = GAME_STATE.FirstCardAwaits
  },
  dispatchCardAction (card){
    if(!card.classList.contains('back')){
      return
    }
    switch(this.currentState){
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card)
        model.revealedCards.push(card)
        this.currentState = GAME_STATE.SecondCardAwaits
        break
      case GAME_STATE.SecondCardAwaits:
        model.triedTimes += 1
        view.renderTriedTimes()
        view.flipCards(card)
        model.revealedCards.push(card)
        //判斷是否一樣
        if (model.isRevealedCardMatched()){
          this.currentState = GAME_STATE.CardsMatched
          model.score+=10
          view.renderScore()
          view.renderMatchedCards(...model.revealedCards)
          model.revealedCards = []
          if (model.score === 260) {
            console.log('showGameFinished')
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinished() 
            return
          }
          this.currentState = GAME_STATE.FirstCardAwaits
        } else{
          this.currentState = GAME_STATE.CardsMatchFailed
          view.appendWrongAnimation(...model.revealedCards)
          setTimeout(controller.resetCards, 1000)
        }
        break
    }
    console.log (this.currentState)
    console.log (model.revealedCards.map(card => (card.dataset.id)))
  },
}


controller.generateCards()

const allCards = document.querySelectorAll('.card')
allCards.forEach(card => {
  card.addEventListener('click', event => {
    controller.dispatchCardAction(card)
    //不能使用event.target當作參數因為可能會點擊到子元素
  })
})


