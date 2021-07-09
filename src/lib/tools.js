export function dataURItoBlob (dataURI) {
  // convert base64/URLEncoded data component to raw binary data held in a string
  var byteString
  if (dataURI.split(',')[0].indexOf('base64') >= 0) {
    byteString = atob(dataURI.split(',')[1])
  } else {
    byteString = unescape(dataURI.split(',')[1])
  }

  // separate out the mime component
  var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

  // write the bytes of the string to a typed array
  var ia = new Uint8Array(byteString.length)
  for (var i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i)
  }

  return new Blob([ia], { type: mimeString })
}

export function getAnimalese (audioUrl = '/animalese.wav') {
  return new Promise((resolve, reject) => {
    if (!getAnimalese.instance) {
      console.log('初始化動物聲音產生器')
      getAnimalese.instance = new window.Animalese(audioUrl, (e) => {
        if (e) {
          reject(e)
        } else {
          resolve(getAnimalese.instance)
        }
      })
    } else {
      resolve(getAnimalese.instance)
    }
  })
}

export async function generateVoiceAsync (str, shorten = false, pitch = 1.0) {
  let synth = await getAnimalese()
  return synth.Animalese(str, shorten, pitch).dataURI
}

export function generateVoice (str, shorten = false, pitch = 1.0) {
  let synth = getAnimalese.instance
  if (synth) {
    return synth.Animalese(str, shorten, pitch).dataURI
  } else {
    throw new Error('Animalese 尚未初始化')
  }
}
