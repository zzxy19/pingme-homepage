'use strict'

function sudokuController() {
    var self = this;
        
    var seed = [
        ['e','c','d','f','g','h','i','a','b'],
        ['f','g','b','a','i','e','c','d','h'],
        ['a','i','h','c','d','b','e','f','g'],
        ['h','e','i','g','f','a','d','b','c'],
        ['d','b','f','h','e','c','g','i','a'],
        ['g','a','c','i','b','d','h','e','f'],
        ['i','f','a','e','c','g','b','h','d'],
        ['b','h','g','d','a','i','f','c','e'],
        ['c','d','e','b','h','f','a','g','i']
                ];
    self.matrix = [];
    var permutation = [0,1,2,3,4,5,6,7,8,9];
    var difficulty = 30;
    
    var randomPermutation = function() {
        var rand, temp;
        for (var i=1; i<10; i++) {
            rand = getRand(10-i) + i;
            temp = permutation[i];
            permutation[i] = permutation[rand];
            permutation[rand] = temp;
        }
    };
    
    var swapRow = function(matrix) {
        var temp;
        temp = matrix[0];
        matrix[0] = matrix[8];
        matrix[8] = temp;
        temp = matrix[1];
        matrix[1] = matrix[7];
        matrix[7] = temp;
        temp = matrix[2];
        matrix[2] = matrix[6];
        matrix[6] = temp;
        temp = matrix[3];
        matrix[3] = matrix[5];
        matrix[5] = temp;
    };
    
    var swapColumn = function(matrix) {
        var i, temp;
        for (i=0; i<9; i++) {
            temp = matrix[i][0];
            matrix[i][0] = matrix[i][8];
            matrix[i][8] = temp;
            temp = matrix[i][1];
            matrix[i][1] = matrix[i][7];
            matrix[i][7] = temp;
            temp = matrix[i][2];
            matrix[i][2] = matrix[i][6];
            matrix[i][6] = temp;
            temp = matrix[i][3];
            matrix[i][3] = matrix[i][5];
            matrix[i][5] = temp;
        }
    };
    
    var swapMajorDiagonal = function(matrix) {
        var i, j, temp;
        for (i=0; i<8; i++) {
            for (j=i+1; j<9; j++) {
                temp = matrix[i][j];
                matrix[i][j] = matrix[j][i];
                matrix[j][i] = temp;
            }
        }
    };
    
    var swapMinorDiagonal = function(matrix) {
        var i, j, temp;
        for (i=0; i<8; i++) {
            for (j=0; j<9-i; j++) {
                temp = matrix[i][j];
                matrix[i][j] = matrix[8-j][8-i];
                matrix[8-j][8-i] = temp;
            }
        }
    };
    
    var getRand = function(n) {
        return Math.floor(Math.random() * n) % n;
    };
    
    var knockOutMatrixElement = function(element) {
        element.value = null;
        element.isDiabled = false;
    };
    
    var makeMatrixDisableField = function(matrix) {
        for (var i=0; i<9; i++) {
            for (var j=0; j<9; j++) {
                matrix[i][j] = {
                    value: matrix[i][j],
                    isDiabled: true
                };
            }
        }
    };
    
    var getNumberFromLetter = function(letter) {
        switch (letter) {
        case 'a':
            return 1;
        case 'b':
            return 2;
        case 'c':
            return 3;
        case 'd':
            return 4;
        case 'e':
            return 5;
        case 'f':
            return 6;
        case 'g':
            return 7;
        case 'h':
            return 8;
        case 'i':
            return 9;
        }
    };
    
    var initMatrix = function() {
        randomPermutation();
        var number, permuted;
        var matrix = angular.copy(seed);
        for (var i=0; i<9; i++) {
            for (var j=0; j<9; j++) {
                number = getNumberFromLetter(matrix[i][j]);
                permuted = permutation[number];
                matrix[i][j] = permuted;
            }
        }
        return matrix;
    };
    
    var randomlyKnockOutElementsOfMatrix = function(matrix) {
        var row, col;
        for (var i=0; i<difficulty; i++) {
            row = getRand(9);
            col = getRand(9);
            knockOutMatrixElement(matrix[row][col]);
        }
    };
    
    var initSudoku = function() {
        var matrix = initMatrix();
        var i, rand;
        for (i=0; i<1000; i++) {
            rand = getRand(4);
            if (rand == 0) {
                swapRow(matrix);
                swapMajorDiagonal(matrix);
                swapMinorDiagonal(matrix);
            }
            else if (rand == 1) {
                swapRow(matrix);
                swapMajorDiagonal(matrix);
            }
            else if (rand == 2) {
                swapColumn(matrix);
                swapMajorDiagonal(matrix);
                swapMinorDiagonal(matrix);
            }
            else {
                swapColumn(matrix);
                swapMinorDiagonal(matrix);
            }
        }
        makeMatrixDisableField(matrix);
        randomlyKnockOutElementsOfMatrix(matrix);
        self.matrix = matrix;
    };
    
    var verifyRowCorrect = function(r) {
        var vote = [0,0,0,0,0,0,0,0,0];
        var row = self.matrix[r];
        var ele;
        for (var i=0; i<9; i++) {
            ele = row[i].value - 1;
            if (ele == null || isNaN(ele) || ele < 0 || ele > 8)
                return false;
            vote[ele]++;
            if (vote[ele] > 1)
                return false;
        }
        return true;
    };
    
    var verifyColumnCorrect = function(c) {
        var vote = [0,0,0,0,0,0,0,0,0];
        var ele;
        for (var i=0; i<9; i++) {
            ele = self.matrix[i][c].value - 1;
            if (ele == null || isNaN(ele) || ele < 0 || ele > 8)
                return false;
            vote[ele]++;
            if (vote[ele] > 1)
                return false;
        }
        return true;
    };
    
    var verifyBoxCorrect = function(r1, c1, r2, c2) {
        var vote = [0,0,0,0,0,0,0,0,0];
        var ele;
        for (var row = r1; row < r2; row++) {
            for (var col = c1; col < c2; col++) {
                ele = self.matrix[row][col].value - 1;
                if (ele == null || isNaN(ele) || ele < 0 || ele > 8)
                    return false;
                vote[ele]++;
                if (vote[ele] > 1)
                    return false;
            }
        }
        return true;
    };
    
    var verifyCorrect = function() {
        for (var i=0; i<9; i++) {
            if (!verifyRowCorrect(i) || !verifyColumnCorrect(i))
                return false;
        }
        if (!verifyBoxCorrect(0,0,3,3) ||
            !verifyBoxCorrect(3,0,6,3) ||
            !verifyBoxCorrect(6,0,9,3) ||
            !verifyBoxCorrect(0,3,3,6) ||
            !verifyBoxCorrect(3,3,6,6) ||
            !verifyBoxCorrect(6,3,9,6) ||
            !verifyBoxCorrect(0,6,3,9) ||
            !verifyBoxCorrect(3,6,6,9) ||
            !verifyBoxCorrect(6,6,9,9))
            return false;
        return true;
    };
    
    self.incorrect = false;
    self.correct = false;
    
    self.onVerifySolution = function() {
        if (verifyCorrect()) {
            self.correct = true;
            self.incorrect = false;
        } else {
            self.correct = false;
            self.incorrect = true;
        }
    };
    
    initSudoku();
}