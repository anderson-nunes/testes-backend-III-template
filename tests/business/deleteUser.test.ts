import { ZodError } from "zod";
import { UserBusiness } from "../../src/business/UserBusiness";
import { DeleteUserSchema } from "../../src/dtos/user/deleteUser.dto";
import { HashManagerMock } from "../mocks/HashManagerMock";
import { IdGeneratorMock } from "../mocks/IdGeneratorMock";
import { TokenManagerMock } from "../mocks/TokenManagerMock";
import { UserDatabaseMock } from "../mocks/UserDatabaseMock";
import { BadRequestError } from "../../src/errors/BadRequestError";
import { BaseError } from "../../src/errors/BaseError";

describe("Testando deleteUser", () => {
  const userBusiness = new UserBusiness(
    new UserDatabaseMock(),
    new IdGeneratorMock(),
    new TokenManagerMock(),
    new HashManagerMock()
  );

  test("deve deletar user", async () => {
    const input = DeleteUserSchema.parse({
      idToDelete: "id-mock-fulano",
      token: "token-mock-fulano",
    });

    const output = await userBusiness.deleteUser(input);

    expect(output).toEqual({
      message: "Deleção realizada com sucesso",
    });
  });

  test("zod deve retornar erro caso token não seja enviado na requisição", async () => {
    expect.assertions(1);

    try {
      const input = DeleteUserSchema.parse({
        idToDelete: "id-mock-fulano",
        token: undefined,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(ZodError);
    }
  });

  test("deve retornar erro se tentar deletar conta de outra pessoa", async () => {
    expect.assertions(3);

    try {
      const input = DeleteUserSchema.parse({
        idToDelete: "id-mock-astrodev",
        token: "token-mock-fulano",
      });

      const output = await userBusiness.deleteUser(input);
    } catch (error: unknown) {
      // expect(error).toBeInstanceOf(Error)
      // expect(error).toBeInstanceOf(BaseError)

      // if (error instanceof Error) {
      //   expect(error.message).toBe("somente quem criou a conta pode deletá-la")
      // }

      expect(error).toBeInstanceOf(BadRequestError);

      if (error instanceof BadRequestError) {
        expect(error.message).toBe("somente quem criou a conta pode deletá-la");
        expect(error.statusCode).toBe(400);
      }
    }
  });
});
