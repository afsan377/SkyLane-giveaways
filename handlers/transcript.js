const { createTranscript } = require("discord-html-transcripts");

async function generateTranscript(channel) {
  const attachment = await createTranscript(channel, {
    limit: -1,
    returnType: "attachment",
    filename: `${channel.name}.html`,
    saveImages: true,
    poweredBy: false
  });

  return attachment;
}

module.exports = { generateTranscript };