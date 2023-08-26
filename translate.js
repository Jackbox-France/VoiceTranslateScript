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
        // On sait qu'un audio contient 4 données : son identifiant | un index de tag (non utilisé) | un index de texte | des métadonnées
        for (var j = 0; j < categoryAudioNumber; j++){
            // On récupère les données de chaque audio
            let audioDatas = categoryAudios.slice(j*4, j*4+4);
            let identifiant = audioDatas[0];
            let tagIndex = audioDatas[1];
            let textIndex = audioDatas[2];
            let metadata = audioDatas[3];
            categoryAudiosDatas.push({
                identifiant: identifiant,
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
    `Ceci est un fichier de traduction Jackbox France

Assurez vous de suivre les instructions à la lettre pour que la traduction fonctionne correctement
    - Chaque catégorie contient les audios qui vont ensemble. Par exemple, tous les audios qui sont dits à la fin du jeu etc...\n
    - Une catégorie peut avoir plusieurs types : Texte, Audio et Graphique. Dans notre cas, il faut modifier seulement les catégories de type Audio
    - Les audios peuvent être de différents types : Effaçables ou non effaçables. 
        Les audios effaçables sont des audios choisis au hasard par le jeu. Par exemple, si il y a deux audios effaçables dans une même catégorie, le jeu choisira au hasard de dire le premier ou le deuxième audio, il n'est pas nécessaire d'avoir plus d'un audio non effaçable si vous voulez une traduction minimale.
        Les audios non effaçables sont ceux qui peuvent être utilisés n'importe quand dans le jeu, rien est aléatoire. Il est important de ne pas effacer les audios non effaçables, sinon le jeu ne fonctionnera pas correctement.  
    - Pour chaque audio, vous devez traduire le texte qui est écrit dans le jeu en face de la partie TEXTE TRADUIT. Si vous faites un audio pour ce texte, mettez l'audio dans le dossier audios et entrez le nom de votre fichier dans FICHIER AUDIO.
    - Si il n'y a que des audios effaçables dans une catégories, vous pouvez ajouter un nouvel audio sans soucis. Pour se faire, ajoutez un audio dans une catégorie comme dans cet exemple :
        AUDIO :
            IDENTIFIANT DE L'AUDIO DANS LE JEU : x | 0
            TEXTE : 
            TEXTE TRADUIT : <Votre traduction>
            FICHIER AUDIO : <Votre fichier audio>
            EFFAÇABLE : OUI
    `

    final+="\n\n\n"

    for (var i in categories){
        let category = categories[i];
        final += "CATEGORIE : "+category.id+" ("+category.type+")\n\n";
        for (var j in category.audios){
            let audio = category.audios[j];
            final += "   AUDIO :\n";
            final += "      IDENTIFIANT DE L'AUDIO DANS LE JEU : "+audio.identifiant+" | "+audio.tagIndex+"\n"
            final += "      TEXTE : "+texts[audio.textIndex]+" | "+audio.textIndex+"\n"
            final += "      TEXTE TRADUIT : \n"
            final += "      FICHIER AUDIO : \n"
            final += "      EFFAÇABLE : "+(audio.tagIndex == 0?"OUI":"NON")+"\n\n"
        }
        final += "\n";
    }
    fs.writeFileSync("output/Intermission.json", JSON.stringify(categories));

    // Reconstruction des strings
    
    fs.writeFileSync('output/A_TRADUIRE.txt', final);
}