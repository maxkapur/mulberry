// Namespace
const mulberry = {};


mulberry.isSortedAsc = function (arr) {
    return arr.every((v, i, a) => !i || a[i - 1] <= v);
}


mulberry.sum = function (arr) {
    return arr.reduce(
        function (total, x) { return total + x; },
        0.0
    );
}


// Holds the name, admissions probability, and utility associated with a college
mulberry.College = class {
    constructor(name, f, t) {
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
            return mulberry.newCollegeWithChecks(this.name, this.f, this.t * (1 - c.f));
        } else {
            return mulberry.newCollegeWithChecks(this.name, this.f, this.t - c.ft);
        }
    }
}


// Used internally as a null comparison in sort algorithm
mulberry.DUMMY_COLLEGE = new mulberry.College("Dummy", 0.0, -1.0);


// Safe college constructor that checks variable bounds
mulberry.newCollegeWithChecks = function (name, f, t) {
    console.assert(0 < f & f <= 1, `f = ${f} not in (0, 1]`);
    console.assert(t >= 0, `t = ${t} < 0`);
    return new mulberry.College(name, f, t);
}


// For generating random colleges
mulberry.ADJECTIVES = "Absolute Basic Cowardly Dusty Eternal First Gorgeous Helluva Insincere Just Kramer Last Moldy Northernmost Overrated Practical Questionable Wicked XYZ Yesterday Zealous".split(' ')
mulberry.NOUNS = "College,University,Institute of Technology,Arts Institute,Performance Institute,School of Dentistry,Conservatory,Academy,Police Academy,Polytechnic,Seminary,Ashram,Hermitage".split(",")


// Generate a random college name to serve as a placeholder for user input
mulberry.randomCollegeName = function () {
    let adj = mulberry.ADJECTIVES[Math.floor(Math.random() * mulberry.ADJECTIVES.length)];
    let noun = mulberry.NOUNS[Math.floor(Math.random() * mulberry.NOUNS.length)];
    return `${adj} ${noun}`;
}


// Results of application order computation
mulberry.applicationOrder = class {
    constructor (names, v, p) {
        this.names = names; // Sorted college names
        this.v = v;         // Corresponding valuations
    }

    // Check that the results are cogent
    check() {
        console.log(this.names);
        console.log(this.v);
        console.assert(
            this.names.length == this.v.length,
            "length of output vectors don't agree!"
        );
        console.assert(mulberry.isSortedAsc(this.v), "v not sorted!");
    }
}


// Compute the application order, given an array of colleges
// Modifies colleges in place, so cannot be used repetitively
mulberry.computeApplicationOrder = function (colleges) {
    let m = colleges.length;

    let bestIdx = 0;

    for (let i = 0; i < m; i++) {
        if (colleges[i].ft >= colleges[bestIdx].ft) {
            bestIdx = i;
        }
    }

    let bestC = colleges[bestIdx];

    const result = new mulberry.applicationOrder(
        [bestC.name],   // names
        [bestC.ft]      // v
    )

    for (let j = 0; j < m - 1; j++) {

        console.log(colleges);

        if (j > 0) {
            result.names.push(bestC.name);
            result.v.push(result.v[j - 1] + bestC.ft);
        }

        let newBestIdx = -1;
        let newBestC = mulberry.DUMMY_COLLEGE;

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

    result.names.push(bestC.name);
    result.v.push(result.v[m - 2] + bestC.ft);

    result.check();

    return result;
}


// Building blocks for a college input row:
// Name entry
mulberry.makeNameInputCell = function (j, name) {
    let nameInputCell = document.createElement("td");
    nameInputCell.setAttribute("id", `name-input-wrapper-${j}`);
    let nameInput = document.createElement("input");
    nameInput.setAttribute("type", "string");
    nameInput.setAttribute("value", name);
    nameInput.setAttribute("name", "name-input");
    nameInputCell.appendChild(nameInput);
    return nameInputCell;
}


// Admit probability entry
mulberry.makeFInputCell = function (j, f) {
    let fInputCell = document.createElement("td");
    fInputCell.setAttribute("id", `f-input-wrapper-${j}`);
    let fInput = document.createElement("input");
    fInput.setAttribute("type", "range");
    fInput.setAttribute("min", "1");
    fInput.setAttribute("max", "100");
    fInput.setAttribute("step", "1");
    fInput.setAttribute("value", f);
    fInput.setAttribute("oninput", `mulberry.updateFLabel(${j})`);
    fInput.setAttribute("name", "f-input");
    fInputCell.appendChild(fInput);
    let fInputLabel = document.createElement("label");
    fInputLabel.classList.add("numeric-label");
    fInputLabel.innerText = `${f}%`;
    fInputCell.appendChild(fInputLabel);
    return fInputCell;
}


// Utility entry
mulberry.makeTInputCell = function (j, t) {
    let tInputCell = document.createElement("td");
    tInputCell.setAttribute("id", `t-input-wrapper-${j}`);
    let tInput = document.createElement("input");
    tInput.setAttribute("type", "range");
    tInput.setAttribute("min", "1");
    tInput.setAttribute("max", "500");
    tInput.setAttribute("step", "1");
    tInput.setAttribute("value", t);
    tInput.setAttribute("oninput", `mulberry.updateTLabel(${j})`);
    tInput.setAttribute("name", "t-input");
    tInputCell.appendChild(tInput)
    let tInputLabel = document.createElement("label");
    tInputLabel.classList.add("numeric-label");
    tInputLabel.innerText = `${t}`;
    tInputCell.appendChild(tInputLabel);
    return tInputCell;
}


// Called on input
mulberry.updateFLabel = function (j) {
    let newValue = document.getElementById(`f-input-wrapper-${j}`).firstElementChild.value;
    document.getElementById(`f-input-wrapper-${j}`).lastElementChild.innerText = `${newValue}%`;
}


// Called on input
mulberry.updateTLabel = function (j) {
    let newValue = document.getElementById(`t-input-wrapper-${j}`).firstElementChild.value;
    document.getElementById(`t-input-wrapper-${j}`).lastElementChild.innerText = `${newValue}`;
}


// Generate a new college entry row, with HTML element identifier j
// for later selection
mulberry.newCollegeEntryWithIdx = function (j) {
    let newCollegeEntry = document.createElement("tr");

    let name = mulberry.randomCollegeName();
    let f = Math.ceil(100 * Math.sqrt(Math.random()));
    let t = 3 * f + Math.ceil(200 * Math.random());

    newCollegeEntry.appendChild(mulberry.makeNameInputCell(j, name));
    newCollegeEntry.appendChild(mulberry.makeFInputCell(j, f));
    newCollegeEntry.appendChild(mulberry.makeTInputCell(j, t));

    return newCollegeEntry;
}


// Total number of colleges the user has entered (including deletions)
mulberry.collegeCounter = 0;
// Set of college indices that haven't been deleted
mulberry.collegeIdxs = [];


// When the user clicks the add college button
mulberry.addCollegeEntry = function () {
    let j = mulberry.collegeCounter;
    mulberry.collegeIdxs.push(j);
    document.getElementById("school-input-table-body").appendChild(
        mulberry.newCollegeEntryWithIdx(j)
    );
    mulberry.collegeCounter++;
    document.getElementById("remove-school-button").disabled = false;
    document.getElementById("calculate-button").disabled = false;
}


// When the user clicks the remove college button
mulberry.removeCollegeEntry = function () {
    if (mulberry.collegeIdxs.length > 0) {
        let lastEntry = document.getElementById("school-input-table-body").lastElementChild;
        mulberry.collegeIdxs.pop();
        document.getElementById("school-input-table-body").removeChild(
            lastEntry
        );
    }

    if (mulberry.collegeIdxs.length == 0) {
        document.getElementById("remove-school-button").disabled = true;
        document.getElementById("calculate-button").disabled = true;
    }
}


// Read the data input for college j from fields into College object
mulberry.newCollegeFromJ = function (j, _) {
    let name = document.getElementById(`name-input-wrapper-${j}`).firstElementChild.value;
    let f = parseFloat(document.getElementById(`f-input-wrapper-${j}`).firstElementChild.value) / 100;
    let t = parseFloat(document.getElementById(`t-input-wrapper-${j}`).firstElementChild.value);
    return mulberry.newCollegeWithChecks(name, f, t);
}


// When the user clicks the calculate button:
// Pass the input colleges to the solver and output results in results area
mulberry.calculate = function () {
    let resultsHeaderRow = document.getElementById("results-header-row");
    let resultsList = document.getElementById("results-list");
    resultsList.innerText = "";
    resultsList.appendChild(resultsHeaderRow);

    const colleges = mulberry.collegeIdxs.map(mulberry.newCollegeFromJ);
    const result = mulberry.computeApplicationOrder(colleges);

    document.getElementById("results-placeholder-text").style.setProperty("display", "none");
    document.getElementById("results-wrapper").style.setProperty("display", "block");

    for (let i = 0; i < mulberry.collegeIdxs.length; i++) {
        let resultX = document.createElement("label");
        resultX.setAttribute("name", "name-result");
        resultX.innerText = result.names[i];

        let resultV = document.createElement("label");
        resultV.classList.add("numeric-label");
        resultV.setAttribute("name", "v-result");
        resultV.innerText = result.v[i].toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });

        let resultRow = document.createElement("li");
        let resultLabelsWrapper = document.createElement("div");
        resultLabelsWrapper.appendChild(resultX);
        resultLabelsWrapper.appendChild(resultV);
        resultRow.appendChild(resultLabelsWrapper)
        resultsList.appendChild(resultRow);
    }
}

mulberry.RETAIL_OUTLETS = "at 7/11,at Best Buy,at Radioshack,at Target,at Subway,at Chipotle,on Steam,on Craigslist,at Home Depot,in the greeting cards aisle".split(",")


// Populate the retail outlet with a retail outlet
mulberry.populateRetailOutlet = function () {
    let retailOutlet = mulberry.RETAIL_OUTLETS[
        Math.floor(Math.random() * mulberry.RETAIL_OUTLETS.length)
    ];
    document.getElementById("retail-outlet").innerText = retailOutlet;
}


// Runs on page load
mulberry.initialize = function () {
    // Populate the input area with some random colleges
    for (let _ = 0; _ < 5; _++) { mulberry.addCollegeEntry(); }

    mulberry.populateRetailOutlet();
}
