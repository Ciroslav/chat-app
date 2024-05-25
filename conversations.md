SPEC


## Create conversation

POST 

endpoint:
/conversations/

body:
{
    participants : userId[],
    private: boolean
}
get selfUUID from token

## Update conversation

PUT
can not add more users if conversations is private, creates new conversation instead

endpoint:
/conversations/{conversationId}
{
    participants : userId[],
}

## Delete conversation

DELETE
does not delete conversation, only leaves conversation for specific user

endpoint:
/conversations/{conversationId}


## Create (send message)

POST

endpoint 
conversations/{conversation}/messages/

body:
{
    content: string
    attachments [ attachments{}]
}

## Edit message

PATCH



endpoint:
 conversations/{conversation}/messages/{messageId}

body:
{
    content: string
    attachments [ attachments{}]
}

## Edit message

PATCH



endpoint conversations/{conversation}/messages/{messageId}

body:
{
    content: string
    attachments [ attachments{}]
}

## Delete message

endpoint conversations/{conversation}/messages/{messageId}

