export class Ingredient{
    public name : string;
    public amount : number;

    constructor(name : string, amount:number){
        this.name = name;
        this.amount = amount;
    }
    // or we can do like this below

    /* 
    
    constructor(public name : string, public amount : number){}
    
    */
}