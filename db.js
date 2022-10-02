// функции для работы с базой данных
const pg = require('pg')
const config = require('./db-config.json')
const client = new pg.Client(config)
client.connect();
async function insertUser(user)
{
    const {email, password, name, timestamp} = user;       
}   
async function createUsersTable() // не используется вне этого файла
{
    await client.query(`create table users
    (
        USER_ID BIGSERIAL,
        TIMESTAMP TIMESTAMP WITHOUT TIME ZONE,
        ADMIN BOOLEAN,
        EMAIL TEXT,
        PASSWORD TEXT,
        NICKNAME TEXT,
        PHONE_NUMBER TEXT,
        TELEGRAM TEXT,
        USER_DESCRIPTION TEXT
    )`)
}
async function createGroupsTable() // не используется вне этого файла
{
    await client.query(`create table groups
    (
        GROUP_ID BIGSERIAL,
        TIMESTAMP TIMESTAMP WITHOUT TIME ZONE,
        NAME TEXT,
        DESCRIPTION TEXT        
    )`)
}
async function createGroupMembersTable() // не используется вне этого файла
{
    await client.query(`create table groupmembers
    (
        USER_ID BIGINT,
        GROUP_ID BIGINT,
        ROLE_PRIOR SMALLINT        
    )`)
}
async function createMessagesTable() // не используется вне этого файла
{
    await client.query(`create table messages
    (
        AUTHOR_ID BIGINT,
        CONTENT TEXT,
        TIMESTAMP TIMESTAMP WITHOUT TIME ZONE,
        GROUP_ID BIGINT,
        MESSAGE_ID BIGSERIAL        
    )`)
}
async function initDatabase() // не используется вне этого файла
{
    return Promise.all(
        [
            createUsersTable(),
            createGroupsTable(),
            createGroupMembersTable(), 
            createMessagesTable()
        ]);
}
async function selectFrom(tableName) // не используется вне этого файла
{
    return await client.query(`select * from ${tableName.toString()}`);
}
initDatabase().then(() =>
{
    console.log('ok.')
})