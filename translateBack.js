const fs = require("fs")

let gameAudiosLocation = ""

var readline = require('readline');

var inquirer = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

inquirer.question("Bienvenue sur l'interface de génération de texte de JackboxFrance\n\nPour commencer la conversion, collez dans ce terminal l'emplacement de votre jeu\n", (path) => {
    gameAudiosLocation = path+"/TalkshowExport/project/media";
    inquirer.question("Assurez-vous que les textes sont bien disponibles dans le fichier output/final.txt\n\nAppuyez sur entrée pour continuer\n", (answer) => {
        startConvertScript();
        console.log("Conversion terminée !\n\nVous pouvez trouver le fichier de traduction dans output/final.txt")
        inquirer.close();
    });
});

startConvertScript = () => {
    let traductions = fs.readFileSync('output/A_TRADUIRE.txt','utf8')
    traductions = traductions.split("\n").slice(20).join("\n")
    let categories = []
    categories = traductions.split("\n\n\n")
    let categoriesData = []
    for (var i in categories){
        let categoryType = categories[i].split("\n")[0].split("(")[1]
        if (categoryType == undefined) continue;
        let categoryId = categories[i].split("\n")[0].split(":")[1].split("(")[0].trim()
        console.log(categories[i].split("\n")[0])
        categoryType = categoryType.slice(0, categoryType.length-1)
        switch (categoryType) {
            case "TEXTE":
                categoryType = "T"
                break;
            case "AUDIO":
                categoryType = "A"
                break;
            case "GRAPHIQUE":
                categoryType = "G"
                break;
            default:
                break;
        }
        let audiosData = []
        let audios = categories[i].split("\n\n").slice(1)
        for (var j in audios){
            let audioDatas = audios[j].split("\n").slice(1)
            let audioId = retrieveLineData(audioDatas[0]).split("|")[0].trim()
            console.log(audioDatas)
            let audioTagId = retrieveLineData(audioDatas[0]).split("|")[1].trim()
            let audioText = retrieveLineData(audioDatas[1]).split("|")[0].trim()
            let audioTextIndex = retrieveLineData(audioDatas[1]).split("|")[1].trim()
            let audioTextTranslated = retrieveLineData(audioDatas[2]).trim()
            let audioFileName = retrieveLineData(audioDatas[3]).trim()
            const audioJson = {
                "id": audioId,
                "tagId": audioTagId,
                "text": audioText,
                "textIndex": audioTextIndex,
                "textTranslated": audioTextTranslated,
                "fileName": audioFileName
            }
            audiosData.push(audioJson)
        }
        const categoryJson = {
            "id": categoryId,
            "type": categoryType,
            "audios": audiosData
        }
        categoriesData.push(categoryJson)
    }
    fs.writeFileSync("output/IntermissionBack.json", JSON.stringify(categoriesData));
    let highestId = retrieveHighestAudioId(categoriesData);

    // On retransfère les données comme dans un fichier classique
    let audiosText = fs.readFileSync("input/texts.txt", "utf8").split("^")
    let audiosCategory = [

    ]

    for (var i in categoriesData){
        let category = categoriesData[i]
        let categoryData = ""
        categoryData += category.id+"|"+category.type+"|"+category.audios.length+"|"
        let categoryAudiosData = [

        ]
        for (var j in category.audios){
            let audio = category.audios[j]
            if (audio.id == "x"){
                audio.id = highestId+1
                highestId++
                audiosText.push("")
                audio.textIndex = audiosText.length-1
            }
            let audioText = audio.textTranslated != ""? audio.textTranslated : audio.text
            audiosText[audio.textIndex] = audioText;
            let audioMetadata;
            switch (category.type) {
                case "T":
                    audioMetadata = "X"
                    break;
                case "A":
                    audioMetadata = "M,3"
                    break;
                case "G":
                    audioMetadata = "X"
                    break;
                default:
                    break;
            }
            if (audio.fileName != ""){
                fs.copyFileSync("audios/"+audio.fileName, gameAudiosLocation+"/"+audio.id+".ogg")
            }
            categoryAudiosData.push(audio.id+"|en"+"|"+audio.tagId+"|"+(audio.textIndex)+"|"+audioMetadata)
        }
        categoryData+=categoryAudiosData.join("|")
        audiosCategory.push(categoryData)
    }

    fs.writeFileSync("output/finalTexts.txt", audiosText.join("^"));
    fs.writeFileSync("output/finalIds.txt", audiosCategory.join("^"));

    console.log("Conversion terminée !\n\nVous pouvez trouver les données à entrer dans la constante media et la constante dict respectivement dans les fichiers finalTexts.txt et finalIds.txt")
}

retrieveLineData = (line) => {
    let lineData = line.split(":").splice(1).join(":").trim()
    return lineData
}

retrieveHighestAudioId = (categoriesData) => {
    let highestId = 0
    for (var i in categoriesData){
        let category = categoriesData[i]
        for (var j in category.audios){
            let audio = category.audios[j]
            if (parseInt(audio.id) && parseInt(audio.id) > highestId) highestId = parseInt(audio.id)
        }
    }
    return highestId
}