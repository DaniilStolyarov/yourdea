// функции для работы с базой данных
const pg = require('pg')
const config = require('./db-config.json')
const client = new pg.Client(config)
client.connect();

async function insertUser(user)
{
    const {email, password, name, timestamp} = user;       
}   
async function createExtension()
{
    await client.query(`create extension "uuid-ossp"`)
}
async function createUsersTable() // не используется вне этого файла
{
    await client.query(`create table users
    (
        USER_ID BIGSERIAL PRIMARY KEY,
        TIMESTAMP TIMESTAMP WITHOUT TIME ZONE,
        ADMIN BOOLEAN,
        EMAIL TEXT UNIQUE,
        PASSWORD TEXT,
        NICKNAME TEXT,
        PHONE_NUMBER TEXT,
        TELEGRAM TEXT,
        USER_DESCRIPTION TEXT,
        AVATAR_ID TEXT,
        NAME TEXT,
        SURNAME TEXT,
        PATRONYMIC TEXT,
        BIRTHDATE DATE,
        COUNTRY TEXT,
        CITY TEXT,
        CITIZENSHIP TEXT,
        SEX TEXT,
        HEE TEXT,
        HEE_SPECIALITY TEXT,
        HEE_GRADUATION TEXT,
        OCCUPATION_STATUS TEXT,
        EXPERIENCE TEXT,
        PATENT TEXT,
        COMPANY_OWNER TEXT,
        INN TEXT
    )`)
}
async function createGroupsTable() // не используется вне этого файла
{
    await client.query(`create table groups
    (
        GROUP_ID BIGSERIAL PRIMARY KEY,
        TIMESTAMP TIMESTAMP WITHOUT TIME ZONE,
        NAME TEXT UNIQUE,
        DESCRIPTION TEXT,
        AUTHOR_ID BIGINT            
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
        MESSAGE_ID BIGSERIAL PRIMARY KEY       
    )`)
}
async function createConnectionsTable()
{
    await client.query(`create table connections
    (
        USER_ID BIGINT UNIQUE,
        SESSION UUID UNIQUE          
    )`)
}
async function initDatabase() // не используется вне этого файла
{
    return Promise.all(
        [
            createUsersTable(),
            createGroupsTable(),
            createGroupMembersTable(), 
            createMessagesTable(),
            createConnectionsTable(),
            createExtension()
        ]);
}
async function selectFrom(tableName) // не используется вне этого файла
{
    return await client.query(`select * from ${tableName.toString()}`);
}
async function addUser({email, admin = false, password, name, phoneNum, telegram, description = "empty", avatar_id})
{
    return await client.query(`insert into users 
    (   
        EMAIL,
        ADMIN,
        TIMESTAMP,
        PASSWORD,
        NICKNAME,
        PHONE_NUMBER,
        TELEGRAM,
        USER_DESCRIPTION,
        AVATAR_ID
    ) values
    (
        $1::text, $2::boolean, $3::timestamp without time zone, $4::text, $5::text, $6::text, $7::text, $8::text, $9::text
    )`, [email, admin, new Date (Date.now()).toLocaleString(), password, name, phoneNum, telegram, description, avatar_id])
}
async function addGroup(title, content, author_id)
{
    try
    {
        return client.query(`insert into groups
        (
            TIMESTAMP,
            NAME,
            DESCRIPTION,
            AUTHOR_ID      
        ) values
        (
            $1::TIMESTAMP WITHOUT TIME ZONE,
            $2::text,
            $3::text,
            $4::bigint
        )`, [new Date (Date.now()).toLocaleString(), title, content, author_id])
    }
    catch(err)
    {
        console.log(err)
    }
}
async function addMessage(author_id, group_id, content)
{
    return client.query(`insert into messages
    (
        AUTHOR_ID,
        CONTENT,
        TIMESTAMP,
        GROUP_ID
    ) values
    (
        $1::bigint,
        $2::text,
        $3::TIMESTAMP WITHOUT TIME ZONE,
        $4::bigint
    )`, [author_id, content, new Date (Date.now()).toLocaleString(), group_id])
}
async function getTopicById(id)
{
    return client.query('select * from groups where group_id = $1::bigint', [id]);
}
async function getLastTopics()
{
    return client.query('select * from groups')
}
async function getTopicTitles()
{
    return client.query('select name, group_id, timestamp from groups')
}
async function getUserById(id)
{
    return client.query('select * from users where user_id = $1::bigint', [id]);
}
async function getUserByEmail(email)
{
    return client.query('select * from users where email = $1::text', [email]);
}
async function getUserBySession(key)
{
    return client.query('select * from users where user_id = (select user_id from connections where session = $1::uuid)', [key])
        .catch(err => console.log(err))
}
async function getAuthKey(user_id)
{
    return client.query('select * from connections where user_id = $1::bigint', [user_id])
}
async function upsertConnection(user_id)
{
    return client.query('insert into connections (user_id, session) values($1::bigint, uuid_generate_v4()) on conflict (user_id) do update set session = uuid_generate_v4()', [user_id]);
}
async function getLastGroup()
{
    return client.query('SELECT * FROM GROUPS ORDER BY group_id DESC LIMIT 1');
}
async function getMessagesByTopicId(group_id)
{
    return client.query('SELECT * FROM MESSAGES WHERE GROUP_ID = $1::BIGINT', [group_id])
}
async function updateUserInfo(userInfo)
{
    return client.query(`UPDATE USERS SET 
    NAME = $1::TEXT,
    SURNAME = $2::TEXT,
    PATRONYMIC = $3::TEXT,
    BIRTHDATE = $4::DATE,
    COUNTRY = $5::TEXT,
    CITY = $6::TEXT,
    SEX = $7::TEXT,
    HEE = $8::TEXT,
    HEE_SPECIALITY = $9::TEXT,
    HEE_GRADUATION = $10::TEXT,
    OCCUPATION_STATUS = $11::TEXT,
    EXPERIENCE = $12::TEXT,
    PATENT = $13::TEXT,
    COMPANY_OWNER = $14::TEXT,
    INN = $15::TEXT,
    USER_DESCRIPTION = $16::TEXT,
    CITIZENSHIP = $17::TEXT
    WHERE USER_ID = $18::BIGINT`
    , [userInfo.name, userInfo.surname, userInfo.patronymic, userInfo.birthdate, userInfo.country, userInfo.city, userInfo.sex, userInfo.hee, userInfo.speciality, userInfo.graduation, 
        userInfo.occupation, userInfo.experience, userInfo.patent, userInfo.company, userInfo.inn, userInfo.description, userInfo.citizenship, +userInfo.id])
}
module.exports =
{
    getTopicById, getUserByEmail, getUserById, addUser, getUserBySession, addGroup, getAuthKey, updateUserInfo, upsertConnection, getLastGroup, 
    addMessage, getMessagesByTopicId, getLastTopics, getTopicTitles
}
if (process.argv[2] == 'initAll')
{
    client.query('drop table users, connections, groups, groupmembers, messages').finally(() =>
    {
        client.query('drop extension "uuid-ossp"').then(() =>
        {
            initDatabase();
        })
    })
}
else if (process.argv[2] == 'startAll')
{
    initDatabase();
}