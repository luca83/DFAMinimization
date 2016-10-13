
Set.prototype.equals = function(setB){
    if (this.size !== setB.size) return false;
    for (var a of this) if (!setB.has(a)) return false;
    return true;
}

Set.prototype.isSuperset = function (subset) {
    for (var elem of subset) {
        if (!this.has(elem)) {
            return false;
        }
    }
    return true;
}

Set.prototype.union = function (setB) {
    var union = new Set(this);
    for (var elem of setB) {
        union.add(elem);
    }
    return union;
}

Set.prototype.intersection = function (setB) {
    var intersection = new Set();
    for (var elem of setB) {
        if (this.has(elem)) {
            intersection.add(elem);
        }
    }
    return intersection;
}

Set.prototype.difference = function (setB) {
    var difference = new Set(this);
    for (var elem of setB) {
        difference.delete(elem);
    }
    return difference;
}


var DFA = function (transition, final, start) {
    this.transition = transition;
    this.final = final;
    this.start = start
};

DFA.prototype.states = function () {
    var states = new Set();
    for (var key in this.transition) {
        if (this.transition.hasOwnProperty(key)) {
            if (!states.has(key)) {
                states.add(parseInt(key));
            }
        }
    }
    return states;
};

DFA.prototype.alphabet = function () {
    var alphabet = new Set();

    for (var key in this.transition) {
        if (this.transition.hasOwnProperty(key)) {
            for (var symbol in this.transition[key]) {
                if (!alphabet.has(symbol)) {
                    alphabet.add(symbol);
                }
            }
        }
    }
    return alphabet;
};
DFA.prototype.test = function (string) {
    var state = this.start,
        index = 0;
    var length = string.length;
    var transition = this.transition;
    while (index < length) {
        state = transition[state][string.charAt(index++)];

        if (typeof state === "undefined")
            return false;
    }

    return this.final.indexOf(state) >= 0;
};
/*
 * Unreachable states
 
 let reachable_states:= {q0};
 let new_states:= {q0};
 do {
    temp := the empty set;
    for each q in new_states do
        for all c in Σ do
            temp := temp ∪ {p such that p=δ(q,c)};
        end;
    end;
    new_states := temp \ reachable_states;
    reachable_states := reachable_states ∪ new_states;
 } while(new_states ≠ the empty set);
 unreachable_states := Q \ reachable_states;
 *
 */

DFA.prototype.unreachable = function () {
    var reachable_states = new Set().add(this.start);
    var new_states = new Set().add(this.start);
    var transition = this.transition;
    var alp = this.alphabet();
    do {
        var temp = new Set();

        new_states.forEach(function (q) {
            alp.forEach(function (c) {
                var tstate = transition[q][c];
                if (tstate !== "undefined")
                    temp.add(tstate);
            });
        });
        new_states = temp.difference(reachable_states);
        reachable_states = reachable_states.union(new_states);
    } while (new_states.size != 0);
    var unreachable_states = dfa.states().difference(reachable_states);
    return unreachable_states;
};

/*
 * Hopcroft's algorithm - wikipedia
 * https://en.wikipedia.org/wiki/DFA_minimization
 
 P := {F, Q \ F};
 W := {F};
 while (W is not empty) do
     choose and remove a set A from W
     for each c in Σ do
          let X be the set of states for which a transition on c leads to a state in A
          for each set Y in P for which X ∩ Y is nonempty and Y \ X is nonempty do
               replace Y in P by the two sets X ∩ Y and Y \ X
               if Y is in W
                    replace Y in W by the same two sets
               else
                    if |X ∩ Y| <= |Y \ X|
                         add X ∩ Y to W
                    else
                         add Y \ X to W
          end;
     end;
 end;
 */

DFA.prototype.minimize = function () {
      var states = new Set();
			var i=0;
			for (var state in this.transition)
			{
				states.add(parseInt(state));
			}
      console.log(states);
			
			var FinalSet = new Set();
			for (var i = 0;i < this.final.length ;i++)
			{
				FinalSet = FinalSet.add(parseInt(this.final[i]));
			}
			console.log(FinalSet);
			// Find alphabet
			var alphabet = this.alphabet();
      var transition = this.transition;
     
      console.log("Alphabet")
      console.log(alphabet);

			/// Hopcroft
			var P = new Array(states.difference(FinalSet) , FinalSet);
			var W = new Array(FinalSet);
      console.log("/////// P");
      console.log(P);
      console.log("/////// W");
      console.log(W);
			
			while(W.length > 0)
			{
        // choose and remove a set A from W
      	var A = W.pop();
        
      	// for each c in Σ do
        for (let c of alphabet.values()){
          
          // let X be the set of states for which a transition on c leads to a state in A
          var X = new Set();
          for (var k in this.transition)
          {
              var check = this.transition[k][c];
              if (A.has(check ))
              {
              	X = X.add(parseInt(k));
              }
          }
          console.log("////// X ");
          console.log(X);
          if (X.size > 0)
					{
          	// X FOUND
            //for each set Y in P for which X ∩ Y is nonempty and Y \ X is nonempty do
          	for (var k = 0;k < P.length; k++)
						{
            	var Y = P[k];
							var intersect = X.intersection(Y);
							var diff = Y.difference(X);
              console.log("///// Y");
              console.log(Y);
              
              console.log("///// intersect");
              console.log(intersect);
              
              console.log("///// diff");
              console.log(diff);
              if (intersect.size > 0 && diff.size >0)
							{
                //replace Y in P by the two sets X ∩ Y and Y \ X
								P.splice(k,1, intersect, diff); 
								
								// Search if Y is in W
								var found = false;
								for (var kk = 0;kk < W.length ; kk++)
								{
                	//if Y is in W
									if (W[kk].equals(Y))
									{
                  	//replace Y in W by the same two sets
										W.splice(kk,1, intersect, diff);
										found = true;
										break;
									}
								}
								
								if (!found)
								{
                  // if |X ∩ Y| <= |Y \ X|
									if (intersect.size <= diff.size)
									{
                  	// add X ∩ Y to W
										W.push(intersect);
									}
									else
									{
                    //  add Y \ X to W
										W.push(diff);
									}
								}
							}
          	}
          }
        }
      }
      console.log("--------------- p -------------");
      console.log(P);
      //rebuild dfa
      P.sort(function (a , b) {  return parseInt(Object.keys(a)[0]) -  parseInt(Object.keys(b)[0]) });
      
			var newTransitions = [];
			var newFinals = [];
      console.log("--------------- p sorted-------------");
      console.log(P);
			for (var i = 0; i < P.length; i++)
			{
    
        
				var stateinP = P[i].keys().next().value;
				var newTrans = {};
        var stateTrans = {};
        var s = 0;
        
				for (var symbol in this.transition[stateinP])
				{
					var oldState = this.transition[stateinP][symbol];
					for (var j = 0; j < P.length; j++)
					{
						if (P[j].has(oldState))
						{
							newTrans[symbol] = j;
							break;
						}
					}
         
				}
        
				newTransitions.push(newTrans);
				
				if (this.final.indexOf(parseInt(stateinP)) > -1)
				{
					newFinals.push(i);
				}
			}
      console.log("new transitionoooonnnn");
      console.log(newTransitions);
      
      
      console.log("new finalessssssss");
      console.log(newFinals)

}

var dfa = new DFA({1: {"a": 1, "b": 2}, 2: {"a": 1, "b": 3}, 3: {"a": 1,"b" :2}}, [1], 1);
//console.log(dfa.alphabet());
//console.log(dfa.test("abbba"));
console.log(dfa.unreachable());
dfa.minimize();


 //TEST operation
  /**var setA = new Set([1,2,3,4]),
 setB = new Set([2,3,1,4]),
 setC = new Set([3,4,5,6]);
 
 console.log(setB.equals(setA));
setA.isSuperset(setB); // => true
 setA.union(setC); // => Set [1, 2, 3, 4, 5, 6]
 setA.intersection(setC); // => Set [3, 4]
 setA.difference(setC); // => Set [1, 2]
 console.log(setA);
 **/
