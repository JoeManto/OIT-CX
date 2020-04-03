#include <stdio.h>
#include <string.h>

//id varType varName varValue 1 string LDAP_PASS xxx 2 string EMAIL_PASS xxxx

#define MIN_SIZE 5
#define VALUES_PER_RECORD 4

int main(int argc, char ** argv){
    
    //No overrides
    if(argc == (MIN_SIZE)){
        return 0;
    }
    
    char overrides[1024];

    //loop through each record
    for(int i = MIN_SIZE; i < argc; i += VALUES_PER_RECORD){
        strcat(overrides,argv[i+2]);
        strcat(overrides,"=");
        strcat(overrides,argv[i+3]);
        if(i+VALUES_PER_RECORD < argc) strcat(overrides," ");
    }

    //LDAP_PASS=xxx EMAIL_PASS=xxx node Server/server.js
    printf("%s",overrides);
    return 0;
}