class Node {
    constructor(v,n){
        this.value = v;
        this.next = n;
    }
}
class LinkedList {
    constructor(){
        this.head = new Node(null,null);
    }
    add(value){
        if(this.head.value == null) {
            this.head.value = value;
            return;
        }
        let x = this.head;
        while(x.next != null){
            x = x.next;
        }
        x.next = new Node(value,null);
    }
    remove(index){
        let x = this.head;
        let i = 0;
        while(x.next != null){
            if(i === index-1){
                x.next = x.next.next;
                return;
            }
            x = x.next;
            i++;
        }
    }
    print(){
        let x = this.head;
        while(x !== null){
            console.log(x.value);
            x = x.next;
        }
    }
}

let list = new LinkedList();
list.add(6);
list.add(2);
list.add(3);
list.add(4);
list.remove();

list.print();
