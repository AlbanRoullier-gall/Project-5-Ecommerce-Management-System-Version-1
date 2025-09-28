/**
 * UserMapper
 * Mapper pour convertir entre DTOs et Models
 *
 * Architecture : Mapper pattern
 * - Conversion DTO ↔ Model
 * - Séparation claire des responsabilités
 */
import { User, UserData } from "../../models/User";
import {
  UserPublicDTO,
  UserRegistrationDTO,
  UserUpdateDTO,
  AuthenticatedUserDTO,
} from "../dto";

export class UserMapper {
  /**
   * Convertir un UserRegistrationDTO en UserData
   */
  static userRegistrationDTOToUserData(
    userRegistrationDTO: UserRegistrationDTO
  ): Partial<UserData> {
    return {
      email: userRegistrationDTO.email,
      first_name: userRegistrationDTO.firstName,
      last_name: userRegistrationDTO.lastName,
      role: userRegistrationDTO.role || "customer",
    };
  }

  /**
   * Convertir un UserUpdateDTO en UserData
   */
  static userUpdateDTOToUserData(
    userUpdateDTO: UserUpdateDTO
  ): Partial<UserData> {
    const updateData: Partial<UserData> = {};

    if (userUpdateDTO.firstName !== undefined) {
      updateData.first_name = userUpdateDTO.firstName;
    }
    if (userUpdateDTO.lastName !== undefined) {
      updateData.last_name = userUpdateDTO.lastName;
    }
    if (userUpdateDTO.email !== undefined) {
      updateData.email = userUpdateDTO.email;
    }

    return updateData;
  }

  /**
   * Convertir un User en UserPublicDTO
   */
  static userToPublicDTO(user: User): UserPublicDTO {
    return user.toPublicObject() as UserPublicDTO;
  }

  /**
   * Convertir un JWTPayload en AuthenticatedUserDTO
   * Séparation entre Model et DTO
   */
  static jwtPayloadToAuthenticatedUserDTO(
    jwtPayload: any
  ): AuthenticatedUserDTO {
    return {
      userId: jwtPayload.userId,
      email: jwtPayload.email,
      role: jwtPayload.role,
      firstName: jwtPayload.firstName,
      lastName: jwtPayload.lastName,
    };
  }
}
