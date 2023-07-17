// categories is the main data structure for the app; it looks like this:
//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]
let categories = [];

/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

async function getCategoryIds() {
    console.debug('getCategoryIds')
    const categoryArr = [];
    const randomList = await axios.get('http://jservice.io/api/random?count=50')
    let count = 0;

    for (let i = 0; i<= 99; i++){
        let newCat = randomList.data[i]
        if (newCat != undefined){
            let newID = newCat.category_id;
            if(categoryArr.includes(newID)){
                i--;
            }
            else{
                categoryArr.push(randomList.data[i].category_id)
                count++
            }
        }

        if(count>=6){
            break
        }
    }
    console.log(categoryArr)
    return categoryArr
}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

async function getCategory(catId) {
    console.debug('getCategory')
    let response = await axios.get(`http://jservice.io/api/category?id=${catId}`);
    let cluesObj = {
        title: response.data.title,
        clues: response.data.clues,
        showing: null
    }
    return cluesObj;
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */
async function fillTable() {
    console.debug('fillTable')
    $("#table").append($("<thead id='tableheaders'>"))
    const table = document.querySelector('#table');

    for (let i = 0; i <=5; i++){
    let catRow = document.createElement("tr")
    let title = document.createElement("td")
    title.setAttribute('class','header')
    title.innerText = categories[i].title
    catRow.append(title);

    let catClues = categories[i].clues
        for (let j=0; j<5; j++){
            let newTD = document.createElement("td");
            // newTD.innerText = catClues[j].question
            catRow.append(newTD)
            newTD.setAttribute('showing', 'null')
            newTD.setAttribute('id', `${i}` + `${j}`)

            let img = document.createElement('img');
            img.src = 'https://encycolorpedia.com/emojis/white-question-mark.svg'
            newTD.append(img)
        }
        table.append(catRow);
    }
    hideLoadingView();
}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */
function handleClick(evt) {
    console.debug('handleClick')
    const box = evt;
    if(box.getAttribute('showing')==='question'){
        box.setAttribute('showing','answer')
    }
    if (box.getAttribute('showing')==='null' ){
        box.setAttribute('showing','question')
    }
}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView() {
    console.debug('showLoadingView')
   $("#loadingImg").removeClass("hideLoad").addClass('seeLoad')
   document.getElementById("begin").disabled = false;
}

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {
    console.debug('hideLoadingView')
    $("#loadingImg").removeClass('seeLoad').addClass('hideLoad')
    $("button").text("Restart").removeClass("btnLoad")
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */
async function setupAndStart() {
    console.debug('setupAndStart')
    const catArr = await getCategoryIds();
    for (let i = 0; i < 6; i++){
        categories[i] = await getCategory(catArr[i]);
    }
    fillTable();    
}

/** On click of start / restart button, set up game. */
const startBtn = document.querySelector("#begin");
startBtn.addEventListener("click", function(e){
    e.target.disabled = true;
    $("#table").empty();
    showLoadingView();
    setupAndStart();
})

/** On page load, add event handler for clicking clues */
const table = document.querySelector("table");
table.addEventListener("click", function(e){
    const box = e.target;
    let idNum = '';

    if(box.getAttribute('showing')==='question'){
        box.setAttribute('showing','answer')
        idNum = box.getAttribute('id');
        const answer = categories[idNum.charAt(0)].clues[idNum.charAt(1)].answer;
        box.innerText = answer;
    }
    if (box.getAttribute('showing')==='null' ){
        box.setAttribute('showing','question');
        idNum = box.getAttribute('id');
        const question = categories[idNum.charAt(0)].clues[idNum.charAt(1)].question;
        box.innerText = question;
    }
    if(box.parentNode.getAttribute('showing')==='null'){
        box.parentNode.setAttribute('showing','question')
        idNum = box.parentNode.getAttribute('id');
        const question = categories[idNum.charAt(0)].clues[idNum.charAt(1)].question;
        box.parentNode.innerText = question;
    }   
    
})