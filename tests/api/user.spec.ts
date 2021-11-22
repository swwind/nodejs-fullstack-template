import Koa from "koa";
import body from "koa-body";
import should from "should";
import supertest, { SuperTest, Test } from "supertest";
import { dropDatabase, stopMongoDB } from "../../app/db";
import { clearBucket } from "../../app/minio";
import router from "../../app/router";
import { randomString } from "../../app/utils";

import crypto from "crypto";

const md5 = (d: Buffer) => crypto.createHash("md5").update(d).digest("hex");

const app = new Koa();

app.use(body({ multipart: true }));
app.use(router.routes());
app.use(router.allowedMethods());

describe("Web API Test", () => {
  const rootPassword = randomString(20);
  const userPassword = randomString(20);
  let rootCookie = "";
  let userCookie = "";
  let agent: SuperTest<Test> = null;
  let server: ReturnType<Koa["listen"]> = null;

  it("Clean up & Start server", async () => {
    should.exists(process.env.TESTING);
    should(await dropDatabase()).true();
    await clearBucket();
    server = app.listen();
    agent = supertest(server);
  });

  it("Sign up new user", async () => {
    await agent
      .post("/api/user/signup")
      .field("username", "#user")
      .field("password", "Passw0rd!")
      .expect(400)
      .expect((res) => {
        should(res.body.error).equals("common/wrong_arguments");
        should(res.body.message).startWith(
          "username must match the following:"
        );
      });

    await agent
      .post("/api/user/signup")
      .field("username", "root")
      .field("password", "")
      .expect(400)
      .expect((res) => {
        should(res.body.error).equals("common/wrong_arguments");
        should(res.body.message).equal(
          "password must be at least 8 characters"
        );
      });

    await agent
      .post("/api/user/signup")
      .field("username", "root")
      .field("password", rootPassword)
      .expect(200)
      .expect((res) => {
        const cookie = res.header["set-cookie"]?.[0];
        should.exists(cookie);
        should(cookie).String();
        should(cookie).match(/^auth=[a-z0-9]{64};/);
        rootCookie = cookie.slice(0, 69).slice(5);
        rootCookie.should.lengthOf(64);
      });

    await agent
      .post("/api/user/signup")
      .field("username", "root")
      .field("password", userPassword)
      .expect(400)
      .expect((res) => should(res.body.error).equal("user/exist"));

    await agent
      .post("/api/user/signup")
      .field("username", "user")
      .field("password", userPassword)
      .expect(200)
      .expect((res) => {
        const cookie = res.header["set-cookie"]?.[0];
        should.exists(cookie);
        should(cookie).String();
        should(cookie).match(/^auth=[a-z0-9]{64};/);
        userCookie = cookie.slice(0, 69).slice(5);
        userCookie.should.lengthOf(64);
      });
  });

  it("Get / Modify user profile", async () => {
    await agent
      .get("/api/user/profile")
      .expect(200)
      .expect((res) => should(res.body).null());

    await agent
      .get("/api/user/profile/root")
      .expect(200)
      .expect((res) => should(res.body).not.null())
      .expect((res) => should(res.body._id).equal("root"))
      .expect((res) => should(res.body.nickname).equal(""))
      .expect((res) => should(res.body.email).equal(""))
      .expect((res) => should(res.body.avatar).equal(""));

    await agent
      .get("/api/user/profile/swwind")
      .expect(404)
      .expect((res) => should(res.body.error).equal("user/not_exist"));

    await agent
      .get("/api/user/profile")
      .set("Cookie", `auth=${rootCookie}`)
      .expect(200)
      .expect((res) => should(res.body).not.null())
      .expect((res) => should(res.body._id).equal("root"))
      .expect((res) => should(res.body.nickname).equal(""))
      .expect((res) => should(res.body.email).equal(""))
      .expect((res) => should(res.body.avatar).equal(""));

    await agent
      .get("/api/user/profile")
      .set("Cookie", `auth=${userCookie}`)
      .expect(200)
      .expect((res) => should(res.body).not.null())
      .expect((res) => should(res.body._id).equal("user"))
      .expect((res) => should(res.body.nickname).equal(""))
      .expect((res) => should(res.body.email).equal(""))
      .expect((res) => should(res.body.avatar).equal(""));

    await agent
      .patch("/api/user/profile")
      .set("Cookie", `auth=${rootCookie}`)
      .expect(200)
      .expect((res) => should(res.body).not.null())
      .expect((res) => should(res.body._id).equal("root"))
      .expect((res) => should(res.body.nickname).equal(""))
      .expect((res) => should(res.body.email).equal(""))
      .expect((res) => should(res.body.avatar).equal(""));

    await agent
      .patch("/api/user/profile")
      .set("Cookie", `auth=${rootCookie}`)
      .field("nickname", "Super User")
      .expect(200)
      .expect((res) => should(res.body).not.null())
      .expect((res) => should(res.body._id).equal("root"))
      .expect((res) => should(res.body.nickname).equal("Super User"))
      .expect((res) => should(res.body.email).equal(""))
      .expect((res) => should(res.body.avatar).equal(""));

    await agent
      .get("/api/user/profile")
      .set("Cookie", `auth=${rootCookie}`)
      .expect(200)
      .expect((res) => should(res.body).not.null())
      .expect((res) => should(res.body._id).equal("root"))
      .expect((res) => should(res.body.nickname).equal("Super User"))
      .expect((res) => should(res.body.email).equal(""))
      .expect((res) => should(res.body.avatar).equal(""));

    await agent
      .patch("/api/user/profile")
      .set("Cookie", `auth=${rootCookie}`)
      .field("email", "root@example.com")
      .field("nickname", "")
      .field("avatar", "/favicon.ico")
      .expect(200)
      .expect((res) => should(res.body._id).equal("root"))
      .expect((res) => should(res.body.nickname).equal(""))
      .expect((res) => should(res.body.email).equal("root@example.com"))
      .expect((res) => should(res.body.avatar).equal("/favicon.ico"));
  });

  it("Sessions and sign in", async () => {
    let rootCookie2 = "";

    await agent
      .post("/api/user/signin")
      .field("username", "Ohhhhh")
      .field("password", "wrong!xxxx")
      .expect(404)
      .expect((res) => should(res.body.error).equal("user/not_exist"));

    await agent
      .post("/api/user/signin")
      .field("username", "root")
      .field("password", "")
      .expect(400)
      .expect((res) => should(res.body.error).equal("common/wrong_arguments"));

    await agent
      .post("/api/user/signin")
      .field("username", "root")
      .field("password", "motherfucker")
      .expect(400)
      .expect((res) => should(res.body.error).equal("user/password_wrong"));

    await agent
      .post("/api/user/signin")
      .field("username", "root")
      .field("password", rootPassword)
      .set("Cookie", `auth=${rootCookie}`)
      .expect(403)
      .expect((res) => should(res.body.error).equal("user/logout_required"));

    await agent
      .post("/api/user/signin")
      .field("username", "root")
      .field("password", rootPassword)
      .expect(200)
      .expect((res) => {
        const cookie = res.header["set-cookie"]?.[0];
        should.exists(cookie);
        should(cookie).String();
        should(cookie).match(/^auth=[a-z0-9]{64}/);
        rootCookie2 = cookie.slice(0, 69).slice(5);
        rootCookie2.should.lengthOf(64);
      });

    await agent
      .get("/api/user/profile")
      .set("Cookie", `auth=${rootCookie2}`)
      .expect(200)
      .expect((res) => should(res.body._id).equal("root"))
      .expect((res) => should(res.body.nickname).equal(""))
      .expect((res) => should(res.body.email).equal("root@example.com"))
      .expect((res) => should(res.body.avatar).equal("/favicon.ico"));

    await agent
      .get("/api/user/session")
      .set("Cookie", `auth=${rootCookie2}`)
      .expect(200)
      .expect((res) => should(res.body).Array())
      .expect((res) => should(res.body).lengthOf(2))
      .expect((res) => should(res.body[0]._id).equal(rootCookie2))
      .expect((res) => should(res.body[0].userId).equal("root"))
      .expect((res) => should(res.body[1]._id).equal(rootCookie))
      .expect((res) => should(res.body[1].userId).equal("root"));

    await agent
      .delete(`/api/user/session/${userCookie}`)
      .set("Cookie", `auth=${rootCookie2}`)
      .expect(403)
      .expect((res) => should(res.body.error).equal("user/permission_denied"));

    await agent
      .delete(`/api/user/session/${randomString(32)}`)
      .set("Cookie", `auth=${rootCookie2}`)
      .expect(404)
      .expect((res) => should(res.body.error).equal("user/session_not_found"));

    await agent
      .delete(`/api/user/session/${rootCookie}`)
      .set("Cookie", `auth=${rootCookie2}`)
      .expect(204);

    await agent
      .get("/api/user/profile")
      .set("Cookie", `auth=${rootCookie}`)
      .expect(200)
      .expect((res) => should(res.body).null());

    await agent
      .get("/api/user/session")
      .set("Cookie", `auth=${rootCookie2}`)
      .expect(200)
      .expect((res) => should(res.body).Array())
      .expect((res) => should(res.body).lengthOf(1))
      .expect((res) => should(res.body[0]._id).equal(rootCookie2))
      .expect((res) => should(res.body[0].userId).equal("root"));

    rootCookie = rootCookie2;
  });

  it("Upload files", async () => {
    const ATTACK204MD5 = "2e2f1670036d8429595864130ed35af7";
    const ATTACK204HEAD20MD5 = "052455c21485463825e8edff3f3ad8ad";
    const ERUIHNIYHBKBNFMD5 = "d78f1d10f19e8171622f32419aa2cb62";

    await agent
      .put("/api/user/file/test.jpeg")
      .set("Cookie", `auth=${rootCookie}`)
      .attach("file", "tests/attack204.jpeg")
      .expect(200)
      .expect((res) => {
        should(res.body.userId).equal("root");
        should(res.body.filename).equal("test.jpeg");
        should(res.body.size).equal(9230);
        should(res.body.created).Number();
        should(res.body.updated).Number();
      });

    await agent
      .get("/fs/user/root/test.jpeg")
      .set("Cookie", `auth=${rootCookie}`)
      .expect(200)
      .expect("Accept-Ranges", "bytes")
      .expect((res) => should(Buffer.isBuffer(res.body)).true())
      .expect((res) => should(md5(res.body)).equal(ATTACK204MD5));

    await agent
      .get("/fs/user/root/test.jpeg")
      .set("Cookie", `auth=${rootCookie}`)
      .set("Range", "bytes=0-19")
      .expect(206)
      .expect("Content-Length", "20")
      .expect((res) => should(md5(res.body)).equal(ATTACK204HEAD20MD5));

    await agent
      .get("/fs/user/root/test.jpeg")
      .set("Cookie", `auth=${rootCookie}`)
      .set("Range", "bytes=998244353-")
      .expect(416)
      .expect("Content-Range", "bytes */9230");

    await agent
      .get("/fs/user/root/test.jpeg")
      .set("Cookie", `auth=${userCookie}`)
      .expect(403);
    await agent
      .get("/fs/user/root/attack204.jpeg")
      .set("Cookie", `auth=${rootCookie}`)
      .expect(404);

    await agent.get("/fs/user/root/test.jpeg").expect(403);

    await agent
      .put("/api/user/file/test.jpeg")
      .set("Cookie", `auth=${rootCookie}`)
      .attach("file", "tests/ERUIHNIYHBKBNF.jpeg")
      .expect(200)
      .expect((res) => {
        should(res.body.userId).equal("root");
        should(res.body.filename).equal("test.jpeg");
        should(res.body.size).equal(18763);
        should(res.body.created).Number();
        should(res.body.updated).Number();
        should(res.body.private).true();
      });

    await agent
      .patch("/api/user/file/notexist")
      .set("Cookie", `auth=${rootCookie}`)
      .field("private", false)
      .expect(404)
      .expect((res) => {
        should(res.body.error).equal("user/file_not_found");
      });

    await agent
      .patch("/api/user/file/test.jpeg")
      .set("Cookie", `auth=${rootCookie}`)
      .field("private", false)
      .expect(200)
      .expect((res) => {
        should(res.body.private).false();
      });

    await agent
      .get("/fs/user/root/test.jpeg")
      .set("Cookie", `auth=${rootCookie}`)
      .expect(200)
      .expect((res) => should(Buffer.isBuffer(res.body)).true())
      .expect((res) => should(md5(res.body)).equal(ERUIHNIYHBKBNFMD5));

    await agent
      .get("/fs/user/root/test.jpeg")
      .set("Cookie", `auth=${userCookie}`)
      .expect(200)
      .expect((res) => should(Buffer.isBuffer(res.body)).true())
      .expect((res) => should(md5(res.body)).equal(ERUIHNIYHBKBNFMD5));

    await agent
      .get("/fs/user/root/test.jpeg")
      .expect(200)
      .expect((res) => should(Buffer.isBuffer(res.body)).true())
      .expect((res) => should(md5(res.body)).equal(ERUIHNIYHBKBNFMD5));

    await agent
      .get("/api/user/file")
      .set("Cookie", `auth=${rootCookie}`)
      .expect(200)
      .expect((res) => {
        should(res.body).Array().lengthOf(1);
        should(res.body[0].filename).equal("test.jpeg");
      });

    await agent
      .delete("/api/user/file/test.jpeg")
      .set("Cookie", `auth=${rootCookie}`)
      .expect(204);

    await agent
      .get("/api/user/file")
      .set("Cookie", `auth=${rootCookie}`)
      .expect(200)
      .expect((res) => {
        should(res.body).Array().lengthOf(0);
      });

    await agent
      .delete("/api/user/file/nonexist.pdf")
      .set("Cookie", `auth=${rootCookie}`)
      .expect(404)
      .expect((res) => should(res.body.error).equal("user/file_not_found"));

    const chinese = "你好.html";

    await agent
      .put(`/api/user/file/${encodeURIComponent(chinese)}`)
      .set("Cookie", `auth=${rootCookie}`)
      .attach("file", "index.html")
      .expect(200)
      .expect((res) => {
        should(res.body.filename).equal(chinese);
      });
  });

  it("Sign out", async () => {
    await agent
      .delete("/api/user/signout")
      .set("Cookie", `auth=${randomString(32)}`)
      .expect(401)
      .expect((res) => should(res.body.error).equal("user/login_required"));

    await agent
      .delete("/api/user/signout")
      .set("Cookie", `auth=${userCookie}`)
      .expect(204);

    await agent
      .get("/api/user/profile")
      .set("Cookie", `auth=${userCookie}`)
      .expect(200)
      .expect((res) => should(res.body).null());
  });

  it("Clean up & Close server", async () => {
    should(await dropDatabase()).true();
    await stopMongoDB();
    await clearBucket();
    await new Promise<void>((resolve, reject) => {
      server.close((err) => {
        if (err) reject(err);
        resolve();
      });
    });
  });
});
