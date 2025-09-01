const handlebars = require('handlebars')
const fs = require('fs')
const readline = require('readline');

// Create an interface for input and output
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const askQuestion = (question) => {
  return new Promise((resolve) => {
    rl.question(question + ': ', (answer) => {
      resolve(answer);
    });
  });
};

class RussianTransliterator {
    constructor() {
        // Define basic consonant mapping
        this.consonants = new Set(['б', 'в', 'г', 'д', 'ж', 'з', 'к', 'л', 'м', 'н', 'п', 'р', 'с', 'т', 'ф', 'х', 'ц', 'ч', 'ш', 'щ', 'Б', 'В', 'Г', 'Д', 'Ж', 'З', 'К', 'Л', 'М', 'Н', 'П', 'Р', 'С', 'Т', 'Ф', 'Х', 'Ц', 'Ч', 'Ш', 'Щ']);
        
        // Basic character mappings (excluding special cases)
        this.mapping = {
            'а': 'a', 'А': 'A',
            'б': 'b', 'Б': 'B',
            'в': 'v', 'В': 'V',
            'г': 'g', 'Г': 'G',
            'д': 'd', 'Д': 'D',
            'ж': 'zh', 'Ж': 'Zh',
            'з': 'z', 'З': 'Z',
            'и': 'i', 'И': 'I',
            'й': 'j', 'Й': 'J',
            'к': 'k', 'К': 'K',
            'л': 'l', 'Л': 'L',
            'м': 'm', 'М': 'M',
            'н': 'n', 'Н': 'N',
            'о': 'o', 'О': 'O',
            'п': 'p', 'П': 'P',
            'р': 'r', 'Р': 'R',
            'с': 's', 'С': 'S',
            'т': 't', 'Т': 'T',
            'у': 'u', 'У': 'U',
            'ф': 'f', 'Ф': 'F',
            'х': 'kh', 'Х': 'Kh',
            'ц': 'c', 'Ц': 'C',
            'ч': 'ch', 'Ч': 'Ch',
            'ш': 'sh', 'Ш': 'Sh',
            'щ': 'shch', 'Щ': 'Shch',
            'ы': 'y', 'Ы': 'Y',
            'ь': 'j', 'Ь': 'J', // Ьь as Jj
            ' ': '_'
        };
    }

    isConsonant(char) {
        return this.consonants.has(char);
    }

    transliterate(text) {
        let result = '';
        
        for (let i = 0; i < text.length; i++) {
            const currentChar = text[i];
            const prevChar = i > 0 ? text[i - 1] : null;
            
            // Check if previous character is a consonant or soft sign
            const afterConsonant = prevChar && this.isConsonant(prevChar)
            const afterSoftSign = prevChar && (prevChar == 'ь' || prevChar == 'Ь')
            const afterConsonantOrSoftSign = afterConsonant || afterSoftSign


            // Handle special cases
            switch (currentChar) {
                case 'е':
                    result += afterConsonant ? 'e' : (afterSoftSign ? 'ye' : 'je');
                    break;
                case 'Е':
                    result += afterConsonant ? 'E' : (afterSoftSign ? 'Ye' : 'Je');
                    break;
                case 'я':
                    result += afterConsonantOrSoftSign ? 'ya' : 'ja';
                    break;
                case 'Я':
                    result += afterConsonantOrSoftSign ? 'Ya' : 'Ja';
                    break;
                case 'ю':
                    result += afterConsonantOrSoftSign ? 'yu' : 'ju';
                    break;
                case 'Ю':
                    result += afterConsonantOrSoftSign ? 'Yu' : 'Ju';
                    break;
                case 'ё':
                    result += afterConsonantOrSoftSign ? 'yo' : 'jo';
                    break;
                case 'Ё':
                    result += afterConsonantOrSoftSign ? 'Yo' : 'Jo';
                    break;
                default:
                    // Use basic mapping for all other characters
                    result += this.mapping[currentChar] || currentChar;
            }
        }
        
        return result;
    }
}

// Main async function
const main = async () => {
    const translit = new RussianTransliterator()
    let article = {}

    article['name'] = await askQuestion('Введите название статьи')
    article['page'] = translit.transliterate(article['name']).toLowerCase()

    let templateStr = fs.readFileSync('./templates/article.hbs', 'utf8')
    let template = handlebars.compile(templateStr)
    let fileStr = template(article)
    fs.writeFileSync(`src/${article['page']}.hbs`, fileStr)
    let site_hbs_data = JSON.parse(fs.readFileSync('src/site_hbs_data.json', 'utf8'))
    
    let categories = site_hbs_data['nav']['categories']

    console.log('Выберите категорию:')
    console.log('0) Создать новую категорию')

    for (let i = 0; i < categories.length; i++)
        console.log(`${i + 1}): ${categories[i]['name']}`)

    var category = await askQuestion('Ваш выбор (номер категории)')

    if (category == 0) {
        let newCategoryName = await askQuestion('Введите название новой категории')
        categories.push({'name': newCategoryName, "articles": []})
        category = categories.length
    }

    category--
    categories[category]['articles'].push(article)
    site_hbs_data['nav']['categories'] = categories
    fs.writeFileSync('src/site_hbs_data.json', JSON.stringify(site_hbs_data))
    return
};

main()
