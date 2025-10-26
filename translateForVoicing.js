var readline = require('readline');

const inquirer = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

inquirer.question("Bienvenue sur l'interface de génération de texte de JackboxFrance\n\nPour commencer, ouvrez le fichier TalkshowExport/project/data/start.swf avec JPEXS Free Flash Decompiler. Ouvrez le script ExportMain dans le dossier scripts.\nDans ce script, vous devrez récupérer la valeur de la constante dict (ce qui se trouve entre guillemets) et la valeur de la constante media. Ces valeurs doivent être mise respectivement dans les fichiers ids.txt et texts.txt dans le dossier input de ce programme.\n\nUne fois cela fait, appuyez sur entrée pour continuer.\n", (answer) => {
    startConvertScript();
    console.log("Conversion terminée !\n\nVous pouvez trouver le fichier de traduction dans output/A_TRADUIRE.txt")
    inquirer.close();
});


function startConvertScript(){
    var fs = require("fs");

    var text = fs.readFileSync('input/texts.txt','utf8');
    var id = fs.readFileSync('input/ids.txt','utf8');

    var final = "";

    var texts = text.toString().split("^");
    var categories = [];
    var ids = id.toString().split("^");

    // On fait le tour de chaque catégorie de text
    for (var i in ids){
        // Chaque catégorie est représentée par un numéro (dans notre cas, i)
        // Les données de chaque catégorie sont séparées par des | 
        // On récupère donc les données de chaque catégorie
        let categoryDatas = ids[i].split("|");
        // La première donnée est l'identifiant de la catégorie
        let categoryId = categoryDatas[0];
        // La seconde donnée est le type de la catégorie (T pour un texte, A pour un audio et G pour un graphique)
        let categoryType = "";
        switch (categoryDatas[1]) {
            case "T":
                categoryType = "TEXTE"            
                break;
            case "A":
                categoryType = "AUDIO"
                break;
            case "G":
                categoryType = "GRAPHIQUE"
                break;
            default:
                break;
        }
        // La troisième donnée est le nombre d'audio de cette catégoie
        let categoryAudioNumber = categoryDatas[2];
        // On récupère les données de chaque audio de cette catégorie
        let categoryAudios = categoryDatas.slice(3);
        // On crée un tableau qui contiendra les données de chaque audio
        let categoryAudiosDatas = [];
        // Toutes les données des audios sont séparées par des |
        // On sait qu'un audio contient 5 données : son identifiant | La langue utilisée | un index de tag (non utilisé) | un index de texte | des métadonnées
        for (var j = 0; j < categoryAudioNumber; j++){
            // On récupère les données de chaque audio
            let audioDatas = categoryAudios.slice(j*5, j*5+5);
            let identifiant = audioDatas[0];
            let langue = audioDatas[1]
            let tagIndex = audioDatas[2];
            let textIndex = audioDatas[3];
            let metadata = audioDatas[4];
            categoryAudiosDatas.push({
                identifiant: identifiant,
                langue: langue,
                tagIndex: tagIndex,
                textIndex: textIndex,
                metadata: metadata
            })
        }
        // On ajoute les données de la catégorie au tableau des catégories
        categories.push({
            id: categoryId,
            type: categoryType,
            audios: categoryAudiosDatas
        })
    }

    // A partir de ces données, on peut maintenant créer un fichier txt que les traducteurs pourront utiliser
    final += 
    `Ceci est un fichier de traduction de voix Jackbox France`

    final+="\n\n\n"

    for (var i in categories){
        let category = categories[i];
        if (category.type == "AUDIO"){
            final += "CATEGORIE ["+category.id+"]\n";
            for (var j in category.audios){
                let audio = category.audios[j];
                final += "["+audio.identifiant+"] "+texts[audio.textIndex]+"\n";
            }
            final += "\n";
        }
    }
    fs.writeFileSync("output/Intermission_VOICE.json", JSON.stringify(categories));

    // Reconstruction des strings
    
    fs.writeFileSync('output/A_TRADUIRE_VOICE.txt', final);
}