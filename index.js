//SE INICIALIZA EL MODULO DE FFMPEG
const ffmpeg =  require('fluent-ffmpeg');

/*
//VALIDADOR PARA SABER SI FFMPEG ESTA INSTALADO CORRECTAMENTE
ffmpeg.getAvailableFormats((err, formats) => {
  if (err)
    console.error('ffmpeg no está instalado correctamente', err);
    else 
    console.log('instalado correctamente');
});
*/

/*
    DEBIDO A QUE CADA SEGMENTO DE VIDEO TIENE SU PROPIA PISTA DE AUDIO, PARA QUE SEA MÁS EFICIENTE EL MANEJO,
    SE TIENE QUE JUNTAR CADA SEGMENTO CON SU PISTA DE AUDIO, Y LUEGO JUNTAR LOS SEGMENTOS EN UN VIDEO FINAL.

    DÓNDE:
    SEGMENTO 1 VIDEO + SEGMENTO 1 AUDIO = VIDEO 1
    SEGMENTO 2 VIDEO + SEGMENTO 2 AUDIO = VIDEO 2
    [...]

    PARA QUE AL FINAL SEA
    VIDEO 1 + VIDEO 2 + VIDEO 3 + [...] = VIDEO FINAL

*/

//EJEMPLO DE CÓMO DEBERÍAN DE QUEDAR LOS ARCHIVOS:
//ESTO SE PUEDE VALIDAR MEDIANTE LA FECHA Y HORA DE CADA SEGMENTO DE VIDEO Y AUDIO.

const files = [
  {
    video: './download/74127458-E44-5.mp4',
    audio: './download/74124934-wHS-11.opus',
    output: './tmp/segmento-01.mp4'
  },
  {
    video: './download/74127458-E44-7.mp4',
    audio: './download/74124934-wHS-12.opus',
    output: './tmp/segmento-02.mp4'
  },
  {
    video: './download/74127458-E44-9.mp4',
    audio: './download/74124934-wHS-13.opus',
    output: './tmp/segmento-03.mp4'
  },
  {
    video: './download/74127458-E44-11.mp4',
    audio: './download/74124934-wHS-14.opus',
    output: './tmp/segmento-04.mp4'
  },
  {
    video: './download/74127458-E44-14.mp4',
    audio: './download/74124934-wHS-15.opus',
    output: './tmp/segmento-05.mp4'
  },
  {
    video: './download/74837801-FzJ-0.mp4',
    audio: './download/74837803-gsI-0.opus',
    output: './tmp/segmento-06.mp4'
  }
];

function addAudio(video, audio, output) {
    return new Promise((resolve, reject) => {
        ffmpeg()
        .input(video)
        .input(audio)
        .outputOptions([
        '-map 0:v:0',
        '-map 1:a:0',
        '-c:v copy',
        '-c:a aac',
        '-b:a 128k',
        '-ar 48000',
        '-ac 2'
      ])
      .on('start', (commandLine) => {
        console.log('\nFFmpeg command:');
        console.log(commandLine);
      })
      .on('error', (err, stdout, stderr) => {
        console.error('\nError agregando audio:');
        console.error(err.message);
        console.error(stderr);

        reject(err);
      })
      .on('end', () => {
        console.log(`Segmento generado: ${output}`);
        resolve();
      })
      .save(output);
    });
}

function mergeSegments(){
    return new Promise((resolve, reject) => {

    const command = ffmpeg()
      .input('./tmp/segmento-01.mp4')
      .input('./tmp/segmento-02.mp4')
      .input('./tmp/segmento-03.mp4')
      .input('./tmp/segmento-04.mp4')
      .input('./tmp/segmento-05.mp4')
      .input('./tmp/segmento-06.mp4');

    command
      .on('start', (commandLine) => {
        console.log('\nMerge command:');
        console.log(commandLine);
      })
      .on('progress', (progress) => {
        console.log('Processing: ' + progress.percent/10 + '% done');
      })
      .on('error', (err, stdout, stderr) => {
        console.error('\nError haciendo merge:');
        console.error(err.message);
        console.error(stderr);
        reject(err);
      })
      .on('end', () => {
        console.log('\nVideo final generado correctamente.');
        resolve();
      })
      .mergeToFile(
        './completed/video_prueba.mp4',
        './tmp/'
      );
  });
}

async function processSegments() {
    for (const file of files) {
        console.log(`\nProcesando segmento: ${file.output}`);
        try {
            await addAudio(file.video, file.audio, file.output);
        } catch (err) {
            console.error(`Error procesando segmento: ${file.output}`);
            console.error(err);
        }
    }
}

async function main() {
    await processSegments();
    await mergeSegments();
    console.log('\nProceso completado exitosamente.');
}

main();




/*
//UNIÓN DE VIDEOS SIN AUDIO
const command = ffmpeg()
.input('./download/74127458-E44-5.mp4')
.input('./download/74127458-E44-7.mp4')
.input('./download/74127458-E44-9.mp4')
.input('./download/74127458-E44-11.mp4')
.input('./download/74127458-E44-14.mp4')
.input('./download/74837801-FzJ-0.mp4');


command
.on('start', (commandLine) => {
    console.log('Spawned FFmpeg with command: ' + commandLine);
})
.on('progress', (progress) => {
    console.log('Processing: ' + progress.percent/10 + '% done');
})
.on('error', (err) => {
    console.log('An error occurred: ' + err.message);
})
.on('end', () => {
    console.log('Merging finished successfully!');
})

.mergeToFile('./completed/video_prueba_sin_audio.mp4', './tmp/');
*/