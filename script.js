// Holds the name, admissions probability, and utility associated with a college
class College {
    constructor(name, f, t) {
        console.assert(0 < f <= 1, f);
        console.assert(t > 0, t);
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

const DUMMY_COLLEGE = new College("Dummy", 0.0, -1.0);
const ADJECTIVES = "Absolute Basic Cowardly Dusty Eternal First Gorgeous Helluva Insincere Just Kramer Last Multiplicative Northernmost Overrated Practical Qualitative Wicked XYZ Yesterday Zealous".split(' ')
const NOUNS = "College,University,Institute of Technology,Arts Institute,Conservatory,Academy".split(",")

// Generate a random college name to serve as a placeholder for user input.
function randomCollegeName() {
    let adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    let noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    return `${adj} ${noun}`;
}


// Compute the application order, given an array of colleges
// Modifies colleges in place
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

    for (let j = 0; j < m - 1; j++) {
        
        console.log(colleges);

        if (j > 0) {
            x.push(bestC.name);
            v.push(v[j - 1] + bestC.ft);
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

    console.log(x);
    console.log(v);

    return [x, v];
}

function test() {
    const colleges = [
        new College("Mercury", 0.20, 4.0),
        new College("Venus", 0.40, 2.0),
        new College("Mars", 0.20, 5.0),
        new College("Jupiter", 0.10, 7.0),
        new College("Saturn", 0.80, 0.8),
        new College("Uranus", 0.20, 4.1),
    ];

    const res = applicationOrder(colleges);

    const x = res[0];
    const v = res[1];

    console.log(x);
    console.log(v);
}


function init() {
    for (let _ = 0; _ < 5; _++) {
        addCollegeEntry();
    }
}


function make_nameInputWrapper(j, name) {
    let nameInputWrapper = document.createElement("div");
    nameInputWrapper.setAttribute("id", `name-input-wrapper-${j}`);
    nameInputWrapper.setAttribute("class", "name-input-wrapper");
    let nameInput = document.createElement("input");
    nameInput.setAttribute("type", "string");
    nameInput.setAttribute("value", name);
    nameInputWrapper.appendChild(nameInput);
    return nameInputWrapper;
}

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
    fInputWrapper.appendChild(fInput);
    let fInputLabel = document.createElement("label");
    fInputLabel.innerText = `${f}%`;
    fInputWrapper.appendChild(fInputLabel);
    return fInputWrapper;
}

function make_tInputWrapper(j, t) {
    let tInputWrapper = document.createElement("div");
    tInputWrapper.setAttribute("id", `t-input-wrapper-${j}`)
    tInputWrapper.setAttribute("class", "t-input-wrapper");
    let tInput = document.createElement("input");
    tInput.setAttribute("type", "range");
    tInput.setAttribute("min", "1");
    tInput.setAttribute("max", "50");
    tInput.setAttribute("step", "1");
    tInput.setAttribute("value", t);
    tInput.setAttribute("oninput", `update_t_label(${j})`);
    tInputWrapper.appendChild(tInput)
    let tInputLabel = document.createElement("label");
    tInputLabel.innerText = `${t}`;
    tInputWrapper.appendChild(tInputLabel);
    return tInputWrapper;
}


function update_f_label(j) {
    let newValue = document.getElementById(`f-input-wrapper-${j}`).firstElementChild.value;
    document.getElementById(`f-input-wrapper-${j}`).lastElementChild.innerText = `${newValue}%`;
}

function update_t_label(j) {
    let newValue = document.getElementById(`t-input-wrapper-${j}`).firstElementChild.value;
    document.getElementById(`t-input-wrapper-${j}`).lastElementChild.innerText = `${newValue}`;
}

function newCollegeEntryWithIdx(j) {
    let newCollegeEntry = document.createElement("li");
    newCollegeEntry.setAttribute("class", "school-entry-row");

    let name = randomCollegeName();
    let t = Math.min(25, Math.ceil(-Math.log(Math.random()) * 10));
    let f = Math.ceil(100 / t);

    newCollegeEntry.appendChild(make_nameInputWrapper(j, name));
    newCollegeEntry.appendChild(make_fInputWrapper(j, f));
    newCollegeEntry.appendChild(make_tInputWrapper(j, t));

    return newCollegeEntry;
}


var collegeCounter = 0;
var collegeIdxs = [];

function addCollegeEntry() {
    let j = collegeCounter;
    collegeIdxs.push(j);
    document.getElementById("school-input-area").appendChild(
        newCollegeEntryWithIdx(j)
    );
    collegeCounter++;
}


function removeCollegeEntry() {
    if (document.getElementById("school-input-area").childElementCount > 1) {
        let lastEntry = document.getElementById("school-input-area").lastElementChild;
        collegeIdxs.pop();
        document.getElementById("school-input-area").removeChild(
            lastEntry
        );
    }
}


function calculate() {
    const colleges = collegeIdxs.map(
        function (j, _) {
            let name = document.getElementById(`name-input-wrapper-${j}`).firstElementChild.value;
            let f = parseFloat(document.getElementById(`f-input-wrapper-${j}`).firstElementChild.value) / 100;
            let t = parseFloat(document.getElementById(`t-input-wrapper-${j}`).firstElementChild.value);
            return new College(name, f, t);
        }
    );

    const results = applicationOrder(colleges);
    let resultsArea = document.getElementById("results-area")
    resultsArea.innerText = "";

    for (let i = 0; i < collegeIdxs.length; i++) {
        let resultX = document.createElement("label");
        resultX.setAttribute("class", "x-result");
        resultX.innerText = results[0][i];
        let resultV = document.createElement("label");
        resultV.setAttribute("class", "v-result");
        resultV.innerText = results[1][i].toLocaleString('en-US', {
            minimumFractionDigits: 3,
            maximumFractionDigits: 3,
        });

        let resultRow = document.createElement("li");
        let resultLabelsWrapper = document.createElement("div");
        resultLabelsWrapper.setAttribute("class", "result-labels-wrapper");
        resultLabelsWrapper.appendChild(resultX);
        resultLabelsWrapper.appendChild(resultV);
        resultRow.appendChild(resultLabelsWrapper)
        resultsArea.appendChild(resultRow);
    }
}

