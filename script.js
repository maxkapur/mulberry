function isSortedAsc(arr) {
    return arr.every((v, i, a) => !i || a[i - 1] <= v);
}


function sum(arr) {
    return arr.reduce(
        function (total, x) { return total + x; },
        0.0
    );
}


// Holds the name, admissions probability, and utility associated with a college
class College {
    constructor(name, f, t) {
        console.assert(0 < f & f <= 1, `f = ${f}`);
        console.assert(t > 0, `t = ${t}`);
        this.name = name;
        this.f = f;
        this.t = t;
    }

    get ft() {
        return this.f * this.t;
    }

    // Update t to reflect the marginal utility relative to a portfolio containing c.
    // Returns a college.
    discount(c) {
        if (this.t < c.t) {
            return new College(this.name, this.f, this.t * (1 - c.f));
        } else {
            return new College(this.name, this.f, this.t - c.ft);
        }
    }
}


// This logs a single assertion error to the console; no problem
const DUMMY_COLLEGE = new College("Dummy", 0.0, -1.0);


// For generating random colleges
const ADJECTIVES = "Absolute Basic Cowardly Dusty Eternal First Gorgeous Helluva Insincere Just Kramer Last Multiplicative Northernmost Overrated Practical Qualitative Wicked XYZ Yesterday Zealous".split(' ')
const NOUNS = "College,University,Institute of Technology,Arts Institute,Conservatory,Academy".split(",")


// Generate a random college name to serve as a placeholder for user input.
function randomCollegeName() {
    let adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    let noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    return `${adj} ${noun}`;
}


// Compute the application order, given an array of colleges
// Modifies colleges in place, so cannot be used repetitively
function applicationOrder(colleges) {
    let m = colleges.length;

    var bestIdx = 0;

    for (let i = 0; i < m; i++) {
        if (colleges[i].ft >= colleges[bestIdx].ft) {
            bestIdx = i;
        }
    }

    let bestC = colleges[bestIdx];

    const x = [bestC.name];
    const v = [bestC.ft];
    const p = [bestC.f];

    // Probability of being rejected from all of the schools currently in x
    var p_nowhere = 1 - bestC.f;

    for (let j = 0; j < m - 1; j++) {

        console.log(colleges);

        if (j > 0) {
            x.push(bestC.name);
            v.push(v[j - 1] + bestC.ft);

            // Probably of attending to the jth school
            // = (probability of being rejected from first (j-1) schools)
            // * (probability of getting into j)
            p.push(p_nowhere * bestC.f);
            p_nowhere *= 1 - bestC.f;
        }

        let newBestIdx = -1;
        let newBestC = DUMMY_COLLEGE;

        for (let i = 0; i < bestIdx; i++) {
            colleges[i] = colleges[i].discount(bestC);
            if (colleges[i].ft >= newBestC.ft) {
                newBestIdx = i;
                newBestC = colleges[i];
            }
        }

        for (let i = bestIdx; i < colleges.length - 1; i++) {
            colleges[i] = colleges[i + 1].discount(bestC);
            if (colleges[i].ft >= newBestC.ft) {
                newBestIdx = i;
                newBestC = colleges[i];
            }
        }

        bestIdx = newBestIdx;
        bestC = colleges[newBestIdx];

        colleges.pop();
    }

    x.push(bestC.name);
    v.push(v[m - 2] + bestC.ft);
    p.push(p_nowhere * bestC.f);

    console.log(x);
    console.log(v);
    console.log(p);

    console.assert(isSortedAsc(v), "v not sorted!");
    console.assert(sum(p) <= 1, "sum of probabilities exceeds 1!");

    return [x, v, p];
}


// Building blocks for a college input row:
// Name entry
function make_nameInputWrapper(j, name) {
    let nameInputWrapper = document.createElement("div");
    nameInputWrapper.setAttribute("id", `name-input-wrapper-${j}`);
    nameInputWrapper.setAttribute("class", "name-input-wrapper");
    let nameInput = document.createElement("input");
    nameInput.setAttribute("type", "string");
    nameInput.setAttribute("value", name);
    nameInput.setAttribute("name", "name-input");
    nameInputWrapper.appendChild(nameInput);
    return nameInputWrapper;
}


// Admit probability entry
function make_fInputWrapper(j, f) {
    let fInputWrapper = document.createElement("div");
    fInputWrapper.setAttribute("id", `f-input-wrapper-${j}`)
    fInputWrapper.setAttribute("class", "f-input-wrapper");
    let fInput = document.createElement("input");
    fInput.setAttribute("type", "range");
    fInput.setAttribute("min", "1");
    fInput.setAttribute("max", "100");
    fInput.setAttribute("step", "1");
    fInput.setAttribute("value", f);
    fInput.setAttribute("oninput", `update_f_label(${j})`);
    fInput.setAttribute("name", "f-input");
    fInputWrapper.appendChild(fInput);
    let fInputLabel = document.createElement("label");
    fInputLabel.innerText = `${f}%`;
    fInputWrapper.appendChild(fInputLabel);
    return fInputWrapper;
}


// Utility entry
function make_tInputWrapper(j, t) {
    let tInputWrapper = document.createElement("div");
    tInputWrapper.setAttribute("id", `t-input-wrapper-${j}`)
    tInputWrapper.setAttribute("class", "t-input-wrapper");
    let tInput = document.createElement("input");
    tInput.setAttribute("type", "range");
    tInput.setAttribute("min", "1");
    tInput.setAttribute("max", "500");
    tInput.setAttribute("step", "1");
    tInput.setAttribute("value", t);
    tInput.setAttribute("oninput", `update_t_label(${j})`);
    tInput.setAttribute("name", "t-input");
    tInputWrapper.appendChild(tInput)
    let tInputLabel = document.createElement("label");
    tInputLabel.innerText = `${t}`;
    tInputWrapper.appendChild(tInputLabel);
    return tInputWrapper;
}


// Called on input
function update_f_label(j) {
    let newValue = document.getElementById(`f-input-wrapper-${j}`).firstElementChild.value;
    document.getElementById(`f-input-wrapper-${j}`).lastElementChild.innerText = `${newValue}%`;
}


// Called on input
function update_t_label(j) {
    let newValue = document.getElementById(`t-input-wrapper-${j}`).firstElementChild.value;
    document.getElementById(`t-input-wrapper-${j}`).lastElementChild.innerText = `${newValue}`;
}


// Generate a new college entry row, with HTML element identifier j
// for later selection
function newCollegeEntryWithIdx(j) {
    let newCollegeEntry = document.createElement("li");
    newCollegeEntry.setAttribute("class", "school-entry-row");

    let name = randomCollegeName();
    let f = Math.ceil(100 * Math.sqrt(Math.random()));
    let t = 3 * f + Math.ceil(200 * Math.random());

    newCollegeEntry.appendChild(make_nameInputWrapper(j, name));
    newCollegeEntry.appendChild(make_fInputWrapper(j, f));
    newCollegeEntry.appendChild(make_tInputWrapper(j, t));

    return newCollegeEntry;
}


// Total number of colleges the user has entered (including deletions)
var collegeCounter = 0;
// Set of college indices that haven't been deleted
var collegeIdxs = [];


// When the user clicks the add college button:
function addCollegeEntry() {
    let j = collegeCounter;
    collegeIdxs.push(j);
    document.getElementById("school-input-area").appendChild(
        newCollegeEntryWithIdx(j)
    );
    collegeCounter++;
    document.getElementById("remove-school-button").hidden = false;
}


// When the user clicks the remove college button:
function removeCollegeEntry() {
    if (collegeIdxs.length > 0) {
        let lastEntry = document.getElementById("school-input-area").lastElementChild;
        collegeIdxs.pop();
        document.getElementById("school-input-area").removeChild(
            lastEntry
        );
    }

    if (collegeIdxs.length == 0) {
        document.getElementById("remove-school-button").hidden = true;
    }
}


// When the user clicks the calculate button:
// Pass the input colleges to the solver and output results in results area
function calculate() {
    let resultsHeaderRow = document.getElementById("results-header-row");
    resultsHeaderRow.hidden = false;
    let resultsList = document.getElementById("results-list")
    resultsList.innerText = "";
    resultsList.appendChild(resultsHeaderRow);

    const colleges = collegeIdxs.map(
        function (j, _) {
            let name = document.getElementById(`name-input-wrapper-${j}`).firstElementChild.value;
            let f = parseFloat(document.getElementById(`f-input-wrapper-${j}`).firstElementChild.value) / 100;
            let t = parseFloat(document.getElementById(`t-input-wrapper-${j}`).firstElementChild.value);
            return new College(name, f, t);
        }
    );

    const results = applicationOrder(colleges);

    document.getElementById("results-will-appear-here").hidden = true;
    document.getElementById("results-intro-text").hidden = false;

    for (let i = 0; i < collegeIdxs.length; i++) {
        let resultX = document.createElement("label");
        resultX.setAttribute("class", "x-result");
        resultX.setAttribute("name", "x-result");
        resultX.innerText = results[0][i];

        let resultV = document.createElement("label");
        resultV.setAttribute("class", "v-result");
        resultV.setAttribute("name", "v-result");
        resultV.innerText = results[1][i].toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });

        let resultP = document.createElement("label");
        resultP.setAttribute("class", "p-result");
        resultP.setAttribute("name", "p-result");
        let p = (results[2][i] * 100).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
        resultP.innerText = `${p}%`;

        let resultRow = document.createElement("li");
        let resultLabelsWrapper = document.createElement("div");
        resultLabelsWrapper.setAttribute("class", "result-labels-wrapper");
        resultLabelsWrapper.appendChild(resultX);
        resultLabelsWrapper.appendChild(resultV);
        resultLabelsWrapper.appendChild(resultP);
        resultRow.appendChild(resultLabelsWrapper)
        resultsList.appendChild(resultRow);
    }

    document.getElementById("results-outro-text").hidden = false;
}


const RETAIL_OUTLETS = "at 7/11,at Best Buy,at Radioshack,at Target,at Subway,at Chipotle,on Steam,on Craigslist,at Home Depot,in the greeting cards aisle".split(",")

// Populate the retail outlet with a retail outlet
function populateRetailOutlet() {
    document.getElementById("retail-outlet").innerText = RETAIL_OUTLETS[Math.floor(Math.random() * RETAIL_OUTLETS.length)];
}

// Runs on page load
function init() {
    // Populate the input area with some random colleges
    for (let _ = 0; _ < 5; _++) {
        addCollegeEntry();
    }

    populateRetailOutlet();
}
