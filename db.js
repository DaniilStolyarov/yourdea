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
        USER_ID BIGSERIAL PRIMARY KEY,
        TIMESTAMP TIMESTAMP WITHOUT TIME ZONE,
        ADMIN BOOLEAN,
        EMAIL TEXT UNIQUE,
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
        GROUP_ID BIGSERIAL PRIMARY KEY,
        TIMESTAMP TIMESTAMP WITHOUT TIME ZONE,
        NAME TEXT UNIQUE,
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
        MESSAGE_ID BIGSERIAL PRIMARY KEY       
    )`)
}
async function createConnectionsTable()
{
    await client.query(`create table connections
    (
        USER_ID BIGINT,
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
            createConnectionsTable()
        ]);
}
async function selectFrom(tableName) // не используется вне этого файла
{
    return await client.query(`select * from ${tableName.toString()}`);
}
async function addUser({email, admin = false, password, name, phoneNum, telegram, description = "empty"})
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
        USER_DESCRIPTION  
    ) values
    (
        $1::text, $2::boolean, $3::timestamp without time zone, $4::text, $5::text, $6::text, $7::text, $8::text
    )`, [email, admin, new Date (Date.now()).toLocaleString(), password, name, phoneNum, telegram, description])
}
async function addGroup()
{
    return client.query(`insert into groups
    (
        TIMESTAMP,
        NAME,
        DESCRIPTION      
    ) values
    (
        $1::TIMESTAMP WITHOUT TIME ZONE,
        $2::text,
        $3::text
    )`, [new Date (Date.now()).toLocaleString(), 'Яблоко', `Я́блоко — сочный плод яблони, который употребляется в пищу в свежем и запеченном виде, служит сырьём в кулинарии и для приготовления напитков. Наибольшее распространение получила яблоня домашняя, реже выращивают яблоню сливолистную. Размер красных, зелёных или жёлтых шаровидных плодов 5—13 см в диаметре. Происходит из Центральной Азии, где до сих пор произрастает дикорастущий предок яблони домашней — яблоня Сиверса[1]. На сегодняшний день существует множество сортов этого вида яблони, произрастающих в различных климатических условиях. По времени созревания отличают летние, осенние и зимние сорта, более поздние сорта отличаются хорошей стойкостью.
    Русское слово яблоко возникло в результате прибавления протетического начального «j» к праслав. *ablъko; последнее образовано с помощью суффикса -ъk — от позднепраиндоевропейской основы *āblu — «яблоко» (к той же основе восходят лит. obuolỹs, латыш. ābols, англ. apple, нем. Apfel, галльск. avallo, др.‑ирл. aball[2][3]). Данная основа представляет собой регионализм северо-западных индоевропейских языков и восходит, в свою очередь, к общеиндоевропейской основе (реконструируемой как *(a)masl-[4] или как *ŝamlu-[3]). С суффиксом -onь- та же основа дала яблонь (позднейшее яблоня)[5].

Латинские слова mālum «яблоко» и mālus «яблоня» также восходят к пра-и.е. *(a)masl-/*ŝamlu-[4].`])
}
async function getTopicById(id)
{
    return client.query('select * from groups where group_id = $1::bigint', [id]);
}
async function getUserByEmail(email)
{
    return client.query('select * from users where email = $1::text', [email]);
}
async function createConnection(user_id)
{
    return client.query('insert into connections (user_id, session) values($1::bigint, uuid_generate_v4())', [user_id]);
}
async function getAuthKey(user_id)
{
    return client.query('select * from connections where user_id = $1::bigint', [user_id])
}
async function alterConnection(session)
{
    return client.query('update connections set session = uuid_generate_v4() where session = $1::uuid', [session])
}
module.exports =
{
    getTopicById, getUserByEmail, addUser, createConnection, getAuthKey, alterConnection
}
