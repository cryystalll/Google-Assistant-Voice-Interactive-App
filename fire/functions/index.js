/* eslint-disable no-unused-vars */
const functions = require('firebase-functions')
const { dialogflow, HtmlResponse, SimpleResponse } = require('actions-on-google')
const Dictionary = require('./util/dictionary.js')

const app = dialogflow({ debug: true })

const INSTRUCTIONS =
'Try to type onion or octopus! '

const DICTIONARY = new Dictionary()

/**
 * Pick a random item from an array. This is to make
 * responses more conversational.
 *
 * @param  {array} array representing a list of elements.
 * @return  {string} item from an array.
 */
const randomArrayItem = (array) => {
  return array[Math.floor(Math.random() * array.length)]
}

const WELCOME_BACK_GREETINGS = [
  'Hey, you\'re back to Game!',
  'Welcome back to Game!',
  'I\'m glad you\'re back to play!',
  'Hey there, you made it! Let\'s play Game.'
]

var r = 0
app.intent('Welcome', (conv) => {
  if (conv.user.last.seen) {
    conv.ask(`${randomArrayItem(WELCOME_BACK_GREETINGS)} Would you like to start playing the game? Choose onion or octopus`)
  } else {
    conv.ask('Onion or Octopus?')
  }
  // Replace PROJECT_ID with the ID for your project.

  conv.ask(new HtmlResponse({
    data: {
      playnext: false,
      show: false,
      init: '',
      cha: '',
      output: '',
      state: 'ANI', // 傳給onupdate
      word: ''
    },
    url: 'https://vue-test-1tsd26rsddd.web.app/animation/v3/garbage?v=' + (r++) + '.' + (Math.random() * 100000)
  }))
})

const START_GAME_RESPONSES = [
  'Here octupus:)'

]
app.intent('Octopus', (conv) => {
  if (conv.user.last.seen) {
    conv.ask(new SimpleResponse({
      speech: '<speak><audio src="https://pa-news.s3-ap-southeast-1.amazonaws.com/animal/octopus.wav"/></speak>',
      text: 'haha'
    }))
  } else {
    conv.ask(`${INSTRUCTIONS}`)
  }

  conv.ask(new HtmlResponse({
  // url: `https://snow-pal-try.web.app/submit.html?`,
    data: {
      playnext: false,
      show: false,
      init: 'octopus',
      cha: 'original',
      output: 'Hi~',
      state: 'ANI' // 傳給onupdate
    }

  }))
  conv.user.storage.cha = 'octopus'
})
const START_GAME_RESPONSES2 = [
  'Here onion XD'

]
app.intent('Onion', (conv) => {
  if (conv.user.last.seen) {
    conv.ask(new SimpleResponse({
      speech: '<speak><audio src="https://pa-news.s3-ap-southeast-1.amazonaws.com/animal/onion.wav"/></speak>',
      text: 'haha'
    }))
  } else {
    conv.ask(`${INSTRUCTIONS}`)
  }

  conv.ask(new HtmlResponse({
    // url: `https://snow-pal-try.web.app/submit.html?`,
    data: {
      playnext: false,
      show: false,
      init: 'onion',
      cha: 'onion',
      state: 'ANI', // 傳給onupdate
      output: 'Hi~'
    }
  }))
  conv.user.storage.cha = 'onion'
})

app.intent('Fallback', (conv) => {
//   conv.ask(new SimpleResponse({
//     speech: '<speak><break time="2s"/><audio src="https://pa-news.s3-ap-southeast-1.amazonaws.com/animal/how+do+you+do+today.wav"/></speak>',
//     text: 'haha'
//   }))
  conv.ask(new HtmlResponse({
    data: {
      intent: 'Fallback',
      playnext: false,
      show: true,
      cha: conv.user.storage.cha,
      input: conv.input.raw,
      output: 'How do you do today?',
      state: 'ANI'
    }
  }))
})
/**
 * Provide standard instructions about the game.
 *
 * @param  {conv} standard Actions on Google conversation object.
 */
app.intent('Instructions', (conv) => {
  conv.ask(`${INSTRUCTIONS}`)
  conv.ask(new HtmlResponse())
})

/**
 * Trigger to re-play the game again at anytime.
 *
 * @param  {conv} standard Actions on Google conversation object.
 */
app.intent('Play', (conv) => {
  conv.ask(new HtmlResponse({
    data: {
      playnext: false,
      show: true,
      input: conv.input.raw,
      output: 'Look! This is my ball! ',
      cha: 'throw',
      state: 'ANI',
      runnng: false
      // word: 'throw',
      //   show: true,
      //   input: conv.input.raw,
      //   output: 'Lets play',

    }
  }))

  conv.user.storage.cha = 'original'
})

const TALK = [
  'Hi. Do you like dancing?',
  'I like to dance. And you?',
  'I want to go out and play~'
]

const talkContext = { parameter: 'talk2' }

app.intent('chat', (conv) => {
  conv.contexts.set(talkContext.parameter, 1)
  conv.ask(new HtmlResponse({
    data: {
      playnext: false,
      nextcha: '',
      show: true,
      input: conv.input.raw,
      output: randomArrayItem(TALK),
      cha: 'talk_natural',
      state: 'ANI' // 傳給onupdate
      //  word: 'ball',
      //   show: true,
      //   input: conv.input.raw,
      //   output: 'Lets play',
    }
  }))
  conv.user.storage.cha = 'original'
})

app.intent('talk2', (conv) => {
  conv.ask(new HtmlResponse({
    data: {
      playnext: false,
      nextcha: '',
      show: true,
      input: conv.input.raw,
      output: 'Cool!!',
      cha: 'rotate',
      state: 'ANI' // 傳給onupdate
      //  word: 'ball',
      //   show: true,
      //   input: conv.input.raw,
      //   output: 'Lets play',
    }
  }))
  conv.user.storage.cha = 'original'
})

app.intent('dance', (conv) => {
  // conv.ask(new SimpleResponse({
  //   speech: '<speak><audio src="https://rapgame.s3-ap-southeast-1.amazonaws.com/%E7%AB%A0%E9%AD%9A%E8%B7%B3%E8%88%9E%E9%9B%BB%E5%AD%90%E9%9F%B3.mp3"/></speak>',
  //   text: 'haha'
  // }))
  conv.ask(new HtmlResponse({
    data: {
      playnext: false,
      show: true,
      input: conv.input.raw,
      output: 'dance ~ ooh ooh la la ~',
      cha: 'dance',
      state: 'ANI' // 傳給onupdate
      //  word: 'ball',
      //   show: true,
      //   input: conv.input.raw,
      //   output: 'Lets play'
    }
  }))
  conv.user.storage.cha = 'original'
})

const askContext = { parameter: 'yes' }
const askAnswer = { parameter: 'no' }
// const askAnswer2 = { parameter: 'yes' }

app.intent('ask', (conv) => {
  conv.contexts.set(askContext.parameter, 1)
  conv.ask(new HtmlResponse({
    data: {
      playnext: false,
      show: true,
      input: conv.input.raw,
      output: 'Ok, yan can ask me two questions!!',
      cha: conv.user.storage.cha,
      state: 'ANI' // 傳給onupdate
      //  word: 'ball',
      //   show: true,
      //   input: conv.input.raw,
      //   output: 'Lets play'
    }
  }))
})

app.intent('yes', (conv) => {
  conv.contexts.set(askAnswer.parameter, 1)
  conv.ask(new HtmlResponse({
    data: {
      playnext: false,
      show: true,
      input: conv.input.raw,
      output: 'yes!',
      cha: 'yes1',
      state: 'ANI' // 傳給onupdate
      //  word: 'ball',
      //   show: true,
      //   input: conv.input.raw,
      //   output: 'Lets play'
    }
  }))
  conv.user.storage.cha = 'original'
})

app.intent('no', (conv) => {
//   conv.contexts.set(askAnswer2.parameter, 1)
  conv.ask(new HtmlResponse({
    data: {
      playnext: false,
      show: true,
      input: conv.input.raw,
      output: 'no...',
      cha: 'no1',
      state: 'ANI' // 傳給onupdate
      //  word: 'ball',
      //   show: true,
      //   input: conv.input.raw,
      //   output: 'Lets play'
    }
  }))
  conv.user.storage.cha = 'original'
})

app.intent('jump', (conv) => {
  //   conv.contexts.set(askAnswer2.parameter, 1)
  conv.ask(new HtmlResponse({
    data: {
      playnext: false,
      show: true,
      input: conv.input.raw,
      output: 'jump! jump! jump!',
      cha: 'jump',
      state: 'ANI' // 傳給onupdate
      //  word: 'ball',
      //   show: true,
      //   input: conv.input.raw,
      //   output: 'Lets play'
    }
  }))
  conv.user.storage.cha = 'original'
})

app.intent('sing', (conv) => {
  //   conv.contexts.set(askAnswer2.parameter, 1)
  conv.ask(new HtmlResponse({
    data: {
      playnext: true,
      nextcha: 't3',
      show: true,
      input: conv.input.raw,
      output: 'la la ~ la la ~ la la ~',
      cha: 'dance',
      state: 'ANI' // 傳給onupdate
      //  word: 'ball',
      //   show: true,
      //   input: conv.input.raw,
      //   output: 'Lets play'
    }
  }))
  conv.user.storage.cha = 'original'
})

app.intent('story', (conv) => {
  //   conv.contexts.set(askAnswer2.parameter, 1)
  conv.ask(new HtmlResponse({
    data: {
      v2: true,
      playnext: false,
      // nextcha: 't3',
      show: true,
      input: conv.input.raw,
      output: 'story game!',
      cha: 'story',
      state: 'ANI' // 傳給onupdate
      //  word: 'ball',
      //   show: true,
      //   input: conv.input.raw,
      //   output: 'Lets play'
    }
  }))
  conv.user.storage.cha = 'original'
})

const dotrash = { parameter: 'trash' }
const dotell = { parameter: 'tell' }

app.intent('find', (conv, { target }) => {
  // conv.contexts.set(dotrash.parameter, 1)
  conv.ask(new HtmlResponse({
    data: {
      v2: true,
      playnext: false,
      show: true,
      input: conv.input.raw,
      target,
      action: 'find-object',
      state: 'ANI' // 傳給onupdate
    }
  }))
  conv.user.storage.cha = 'original'
})

app.intent('right', (conv) => {
  //   conv.contexts.set(askAnswer2.parameter, 1)
  conv.ask(new HtmlResponse({
    data: {
      playnext: false,
      nextcha: '',
      show: true,
      input: conv.input.raw,
      output: 'go right!',
      cha: 'right',
      state: 'ANI' // 傳給onupdate
      //  word: 'ball',
      //   show: true,
      //   input: conv.input.raw,
      //   output: 'Lets play'
    }
  }))
  conv.user.storage.cha = 'original'
})

app.intent('left', (conv) => {
  //   conv.contexts.set(askAnswer2.parameter, 1)
  conv.ask(new HtmlResponse({
    data: {
      playnext: false,
      nextcha: '',
      show: true,
      input: conv.input.raw,
      output: 'go left!',
      cha: 'left',
      state: 'ANI' // 傳給onupdate
      //  word: 'ball',
      //   show: true,
      //   input: conv.input.raw,
      //   output: 'Lets play'
    }
  }))
  conv.user.storage.cha = 'original'
})

app.intent('down', (conv) => {
  //   conv.contexts.set(askAnswer2.parameter, 1)
  conv.ask(new HtmlResponse({
    data: {
      playnext: false,
      nextcha: '',
      show: true,
      input: conv.input.raw,
      output: 'go down!',
      cha: 'down',
      state: 'ANI' // 傳給onupdate
      //  word: 'ball',
      //   show: true,
      //   input: conv.input.raw,
      //   output: 'Lets play'
    }
  }))
  conv.user.storage.cha = 'original'
})

app.intent('up', (conv) => {
  //   conv.contexts.set(askAnswer2.parameter, 1)
  conv.ask(new HtmlResponse({
    data: {
      playnext: false,
      nextcha: '',
      show: true,
      input: conv.input.raw,
      output: 'go up!',
      cha: 'up',
      state: 'ANI' // 傳給onupdate
      //  word: 'ball',
      //   show: true,
      //   input: conv.input.raw,
      //   output: 'Lets play'
    }
  }))
  conv.user.storage.cha = 'original'
})

exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app)
