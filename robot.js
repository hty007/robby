Fields = {
  "WALKABLE": ".", // Робби может ходить по этому
  "BLOCKED": "#", // Робби не должен ходить по этому
  "START": "S", // Робби начинает здесь, он также может ходить здесь
  "TARGET": "T" // целевая ячейка, Робби должен достичь
};

function Map(field){
	this.map=field;//Маска
	this.orientation = new Array(this.map.length);//направление
	for (key = 0; key<this.map.length;key++){
		this.orientation[key] = -1;
		}
	/*
	for (let item of this.orientation){
		item=-1;
		}/**/
	this.energy= new Array(this.map.length);//потраченная энергия
	
	this.rang = Math.sqrt(this.map.length);
	
	this.position = function(n,o1,o2,e){
		//обработать позицию (номер, ориентация,енергия)
		//проверка на вхождение в область;
		if (n<0 || n>=this.map.length){
			return false;}
		if (this.map[n] == Fields["START"]){			
			return false;}		
		if (this.map[n] == Fields["BLOCKED"]){
			this.orientation[n]=-1;
			this.energy[n]=-1;
			return false;}
		if (this.map[n] == Fields["WALKABLE"]||this.map[n] == Fields["TARGET"]){			
			//---------------Вычисляем энергию------------------------
			var newEnergy = -1;
			if(o1==o2){newEnergy=e+1;// идет прямо
			}else if (Math.abs(o2-o1)==2||this.energy[n]==0){newEnergy=e+3;// Разворачивается
			}else{newEnergy=e+2;}// поворачивает
			//---------------------------------------
			
			if (this.energy[n]>0){// здесь уже были 
				if (this.energy[n]	> newEnergy){
					this.energy[n]	= newEnergy;
					this.orientation[n]=o2;
					if (this.map[n] == Fields["TARGET"]){return false;}
					return true;
					}
				return false;}
			else{// ещё не были
				this.energy[n]	= newEnergy;			
				this.orientation[n]=o2;// устанавливаем новое направление				
				if (this.map[n] == Fields["TARGET"]){return false;}
				return true;
				}			
			}		
		}
	this.getField = function(x,y){//Получить содержимое клетки
		return this.map.charAt(y*this.rang+x);
		}
	this.getNumber = function(x,y){// Номер клетки
		return (y*this.rang+x);
		}
	this.getCoordinate = function (number){//Координаты по номеру
		var	nx = number%this.rang
		var ny = Math.floor(number/this.rang);
		return {x : nx, y : ny}; 
		}
	this.getStart = function(){
		var s = -1;
		for (var i in this.map ){
			if (this.map[i] == Fields["START"]){
				s=i;
				this.orientation[i]=0; //смотрит в северном направлении
				this.energy[i] = 0;
				return s; 
				}
			}
		
		return s;
		}
	this.getTarget = function(){
		var s = -1;
		for (var i in this.map ){
			if (this.map[i] == Fields["TARGET"]){
				s=i;				
				return s; 
				}
			}		
		return s;
		}
	this.posUp = function(Num){
		var newP = +Num-this.rang;
		return (newP<0)?-1:newP;
		}
	this.posDn = function(Num){
		var newP = +Num+this.rang;
		return (newP>=this.map.length)?-1:newP;
		}
	this.posLf = function(Num){		
		return (Num%this.rang == 0)?-1:Num-1;
		}
	this.posRg = function(Num){		
		var newP = +Num+1;
		return (newP%this.rang == 0)?-1:newP;
		}
	}
/*
 S#...   0
 .#...   U
 ..... 3L R1
 ###..   D
 T....   2
         
 */
function getCommands(field, energy){
	var map = new Map(field);
	var queue = [];//очередь вершин	
	var start = map.getStart();
	
	queue.push(start);
	var current = -1; // Текущая вершина
	while (queue.length !=0){
		current = queue.shift();
		var o1 = map.orientation[current];
		var e = map.energy[current];		
		//вверх		 		
		if (map.position(map.posUp(current),o1,0,e)){//проверка на вхождение в область
			queue.push(map.posUp(current))			
			}
		//направо				
		if (map.position(map.posRg(current),o1,1,e)){
			queue.push(map.posRg(current))			
			}
		//вниз				
		if (map.position(map.posDn(current),o1,2,e)){
			queue.push(map.posDn(current))			
			}
		//вниз				
		if (map.position(map.posLf(current),o1,3,e)){
			queue.push(map.posLf(current))			
			}		
	}
	
	current = map.getTarget();
	if (map.orientation[current]==-1){
		return [];
		};
	///*
	var result = [];
	if (current == -1){
		throw new Error("current == -1");
		return [];
		}
	
	while (current != start){
		var pos = -1; 
		var o2 = map.orientation[current];
		if (o2==0){ pos = map.posDn(current);			
		}else if(o2==1){pos = map.posLf(current);
		}else if(o2==2){pos = map.posUp(current);
		}else if(o2==3){pos = map.posRg(current);
		}else {throw new Error("Что-то пошло не так!");}
		
		var o1 = map.orientation[pos];
		if (o2 == o1 ){result.unshift("f")}// идем прямо
		else if(Math.abs(o2-o1) == 2){// разворот
			result.unshift("f");result.unshift("r");result.unshift("r")}
		else if(o2-o1 == 1 || o2-o1 == -3){// поворт направо
			result.unshift("f");result.unshift("r")}
		else if(o2-o1 == -1 || o2-o1 == 3){// поворт налево
			result.unshift("f");result.unshift("l")}
		current = pos;
		
	} 
	/**/
	if (result.length>energy) return [];
	return result;
	}
Commands = {
  "TURN_RIGHT": "r", // повернуть направо на 90°
  "TURN_LEFT": "l", // повернуть налево на 90°
  "MOVE_FORWARDS": "f" // переместить одно поле вперед в текущем направлении
};
	
	
