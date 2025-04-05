/* 

You are climbing a staircase. It takes n steps to reach the top.

Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?

*/

/* 

Input: n = 2
Output: 2
Explanation: There are two ways to climb to the top.
1. 1 step + 1 step
2. 2 steps

Input: n = 3
Output: 3
Explanation: There are three ways to climb to the top.
1. 1 step + 1 step + 1 step
2. 1 step + 2 steps
3. 2 steps + 1 step

*/

/* 

1 <= n <= 45

*/

var map = new Map();

var climbStairs = function (n) {
    if (n == 0) {
        return 0;
    }
    if (n == 1) {
        return 1;
    }
    if (n == 2) {
        return 2;
    }

    // 1 step
    var ways1;
    if (map.has(n - 1)) {
        ways1 = map.get(n - 1);
    } else {
        ways1 = climbStairs(n - 1);
        map.set(n - 1, ways1);
    }

    // 2 steps
    var ways2;
    if (map.has(n - 2)) {
        ways2 = map.get(n - 2);
    } else {
        ways2 = climbStairs(n - 2);
        map.set(n - 2, ways2);
    }

    return ways1 + ways2;
};
