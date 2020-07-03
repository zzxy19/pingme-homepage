function deduceType() {
    var select1 = document.getElementById("quiz1");
    var select2 = document.getElementById("quiz2");
    var select3 = document.getElementById("quiz3");
    var select4 = document.getElementById("quiz4");
    var select5 = document.getElementById("quiz5");
    deduce(
        selectedValue(select1),
        selectedValue(select2),
        selectedValue(select3),
        selectedValue(select4),
        selectedValue(select5));
}

var deductionMap = {
    "n": "Normal",
    0: "Achromatopsia",
    1: "Protanopia",
    2: "Deuteranopia",
    3: "Tritanopia",
    4: "Deuteranopia(2)"
}

function deduce(s1, s2, s3, s4, s5) {
    console.log(s1,s2,s3,s4,s5);
    let firstFalse;
    if (!orderingIsGood([s1,s2,s3,s4,s5])) {
        concludeType("Unknown");
        return;
    }
    firstFalse = findFirstFalse([s1,s2,s3,s4,s5]);
    concludeType(deductionMap[firstFalse]);
}

function findFirstFalse(arr) {
    let ele, index;
    for (index = 0; index < arr.length; index++) {
        ele = arr[index];
        if (!isTrue(ele)) {
            return index;
        }
    }
    return "n";
}

function orderingIsGood(arr) {
    let startsFalse, index, ele;
    startsFalse = false;
    for (index = 0; index < arr.length; index++) {
        ele = arr[index];
        if (startsFalse) {
            if (isTrue(ele)) {
                return false;
            }
        } else if (!isTrue(ele)) {
            startsFalse = true;
        }
    }
    return true;
}

function concludeType(type) {
    document.getElementById("answer").innerHTML = type;
}

function isTrue(ele) {
    return ele == "y";
}

function selectedValue(selection) {
    return selection.options[selection.selectedIndex].value;
}