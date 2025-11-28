import { ApiError } from "../advices/ApiError";
import { UserRepository } from "../repositories/user.repository";
import { CheckVerificationSchema, ForgotPasswordSchema, LoginSchema, RegistrationSchema, ResendVerificationCode, ResetPasswordSchema, VerifySchema } from "../schema/user.schema";
import asyncHandler from "../utils/asyncHandler";
import { zodErrorFormatter } from "../utils/error.formatter";
import { comparePassword, hashedPasswords } from "../utils/bcrypt.utils";
import { generateOtp, generateTimeStamp } from "../utils/otp.utils";
import type { IUser } from "../models/user.models";
import { ApiResponse } from "../advices/ApiResponse";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.utils";
import { SessionRepository } from "../repositories/session.repository";

export const RegisterController = asyncHandler(async(req, res)=>{
    const result = RegistrationSchema.safeParse(req.body);
    if(!result.success){
        throw new ApiError(400, "Validation Error", zodErrorFormatter(result.error))
    }

    const { name, username, email, password } = result.data;

    const existingUserByEmail = await UserRepository.findUserByEmail(email);

    if(existingUserByEmail?.is_verified === true){
        throw new ApiError(400, "User already exisit with the email")
    }

    const existingUserByUsername = await UserRepository.findUserByUserName(username, true)
    if(existingUserByUsername){
        throw new ApiError(400, 'This username is already taken');
    }

    const hashPassword = await hashedPasswords(password);
    const verification_code = generateOtp();
    const verification_code_expiry = generateTimeStamp('15')
    let userToBeReturn: IUser | null = null;
    let isExistingUser = false;

      if (existingUserByEmail) {
    // A useer exist but not verified ("Rergistration")
    userToBeReturn = await UserRepository.updateUserById(
      String(existingUserByEmail._id),
      {
        name,
        password: hashPassword,
        username,
        verification_code,
        verification_code_expiry,
        is_verified: false
      },
      {
        _id: 1,
        name: 1,
        email: 1,
        username: 1,      // it is a concept of projection the fied which include in db
        is_verified: 1,
        createdAt: 1,
        updatedAt: 1,
      }
    );

    if (!userToBeReturn) {
      throw new ApiError(500, 'Failed to update user');
    }

    isExistingUser = true;

  } else {
    // user doesn't exists (New Registration)
    const createdUser = await UserRepository.createUser({
      name,
      email,
      username,
      password:hashPassword,
      verification_code_expiry,
      verification_code,
      is_verified: false,
    }, {
      _id: 1,
      name: 1,
      email: 1,
      username: 1,
      is_verified: 1,
      createdAt: 1,
      updatedAt: 1,
    });

    if (!createdUser) {
      throw new ApiError(500, 'Failed to create user');
    }

    userToBeReturn = createdUser;
  }

  //send verifiction mail 


  res.status(isExistingUser ? 200 : 201).json(
    new ApiResponse({
        user: userToBeReturn,
        message: 'User registered successfully. Please check your email for verification code '
    })
  )
})

export const LoginController = asyncHandler(async(req, res) => {
     const result = LoginSchema.safeParse(req.body);
     if(!result.success){
        throw new ApiError(400, "Validation Error", zodErrorFormatter(result.error))
     }

     const {email, password} = result.data;

     const savedUser = await UserRepository.findUserByEmail(email)
     if(!savedUser) {
        throw new ApiError(401, "Invallid credentials");
     }

     if(!savedUser.is_verified) {
        throw new ApiError(403, "Please verify your email to login");
     }

     const is_passwordValid = await comparePassword(password, savedUser.password);

     if(!is_passwordValid) {
        throw new ApiError(401, "Invalid Password!");   
     }

     const userToBeReturn = await UserRepository.findUserById(
        String(savedUser._id),
        {
            _id : 1,
            name : 1,
            username : 1,
            is_verified : 1,
            created_at : 1,
            updated_at : 1
        }
     )

     if(!userToBeReturn) {
        throw new ApiError(404, "User not found");
     }

     const access_token = generateAccessToken(userToBeReturn);
     const refresh_token = generateRefreshToken(userToBeReturn);

     const sessionExpiresAt = new Date();

     sessionExpiresAt.setDate(sessionExpiresAt.getDate() + 30);

     await SessionRepository.deleteSessionByUserId(String(userToBeReturn._id))

    //  create new session in db
    const session = await SessionRepository.createSession({
        user_id : String(userToBeReturn._id),
        refresh_token,
        expires_at : sessionExpiresAt
    })

    if(!session) {
        throw new ApiError(500, "Failed to create session");
    }

    res.cookie("refresh_token", refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "Production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    res.cookie("access_token", access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "Production",
        sameSite: "lax",
        maxAge: 10 * 60 * 1000 // 10 min
    });

    res.status(200).json(
        new ApiResponse({
            access_token,
            user : userToBeReturn,
        })
    )
});

export const RefreshAccessToken = asyncHandler(async(req, res) => {
    const refresh_token = req.cookies.refresh_token;

    if(!refresh_token) {
        throw new ApiError(401, "Refresh token not provided");
    }

    const session = await SessionRepository.findSessionByToken(refresh_token);

    if(!session) {
        throw new ApiError(401, "Invalid refresh token");
    }

    const userObj = await UserRepository.findUserById(
        String(session.userId),
        {
            _id: 1,
            name: 1, 
            email: 1,
            username: 1,
            is_verified: 1,
            created_at: 1,
            updated_at: 1
        }
    )

    if(!userObj) {
        throw new ApiError(404, "User not found");
    }

    const access_token = generateAccessToken(userObj)

     res.cookie("access_token", access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "Production",
        sameSite: "lax",
        maxAge: 10 * 60 * 1000 // 10 min
    });

    res.status(200).json(
        new ApiResponse({
            access_token,
            user: userObj
        })
    );
});

export const VerifyUser = asyncHandler(async(req, res) => {
     const result = VerifySchema.safeParse(req.body);
     if(!result.success){
        throw new ApiError(400, "Validation Error", zodErrorFormatter(result.error))
     }

     const {email, verification_code} = req.body;

     if(!email || !verification_code) {
        throw new ApiError(400, "Email and Verification code are required")
     }

     const user = await UserRepository.findUserByEmail(email)

     if(!user) {
        throw new ApiError(404, "User not found")
     }

     if(user.is_verified) {
        throw new ApiError(400, "User is already verified")
     }

     if(!user.verification_code || !user.verification_code_expiry) {
        throw new ApiError(400, "No verification code found, please suggest it again");
     }

     if(user.verification_code !== verification_code) {
        throw new ApiError(400, "Invalid verification code");
     }

     if(new Date() > user.verification_code_expiry) {
        throw new ApiError(400, "Verification code is expired...please register again")
     }

     const verified_user = await UserRepository.updateUserById(
        String(user._id),
        {
            is_verified: true,
            verification_code: undefined,
            verification_code_expiry: undefined
        },
        {
            _id: 1,
            name: 1,
            email: 1,
            username: 1,
            is_verified: 1,
            created_at: 1,
            updated_at: 1
        }
     )

     if(!verified_user) {
            throw new ApiError(409, "failed to verify")
     }

     res.status(200).json(
        new ApiResponse({
            user: verified_user,
            message: "User verified successfully"
        })
     );
});

export const ForgotPasswordController = asyncHandler(async(req, res)=>{
  const result = ForgotPasswordSchema.safeParse(req.body);
  if (!result.success) {
    throw new ApiError(400, "validation Error", zodErrorFormatter(result.error));
  }

  const {email} = result.data;

  const existingUser = await UserRepository.findUserByEmail(email);
  if(!existingUser || !existingUser.is_verified){
    throw new ApiError(404, "User not exist with this email");
  }

  const verification_code = generateOtp();

  await UserRepository.updateUserById(String(existingUser._id),{
      verification_code,
      verification_code_expiry: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
  });

  // Send password reset email


  res.status(200).json(
  new ApiResponse({
    message: `Verification code sent to your email`
  }));
});


export const ResendVerification = asyncHandler(async (req, res) => {
    const result = ResendVerificationCode.safeParse(req.body);
    if (!result.success) {
    throw new ApiError(400, "validation Error", zodErrorFormatter(result.error));
  }
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, 'Email is required');
  }

  const user = await UserRepository.findUserByEmail(email);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (user.is_verified) {
    throw new ApiError(400, 'User is already verified');
  }

  // Generate new verification code
  const verification_code = generateOtp();
  const verification_code_expiry = generateTimeStamp("15");

  // Update user with new verification code
  const updatedUser = await UserRepository.updateUserById(
    String(user._id),
    {
      verification_code,
      verification_code_expiry
    }
  );

  if (!updatedUser) {
    throw new ApiError(500, 'Failed to generate new verification code');
  }

  // Send new verification email

  res.status(200).json(
    new ApiResponse({
      message: 'New verification code sent to your email'
    })
  );
});

export const CheckVerificationCodeController = asyncHandler(async(req, res)=>{
  const result = CheckVerificationSchema.safeParse(req.body);
  if (!result.success) {
    throw new ApiError(400, "validation Error", zodErrorFormatter(result.error));
  }

  const {email, verificationCode} = result.data;

  const existingUser = await UserRepository.findUserByEmail(email);

  if(!existingUser){
    throw new ApiError(404, "User not exist with this email");
  }
  if(existingUser.verification_code != verificationCode){
    throw new ApiError(400, "Invalid verification code");
  }
  if(!existingUser.verification_code_expiry || existingUser.verification_code_expiry.getTime() < Date.now()){
    throw new ApiError(400, "Verification code expired");
  }
  
  res.status(200).json(
  new ApiResponse({
    message: "Verification code is valid"
  }));
});


export const ResetPasswordController = asyncHandler(async(req, res)=>{
  const result = ResetPasswordSchema.safeParse(req.body);

  if (!result.success) {
    throw new ApiError(400, "validation Error", zodErrorFormatter(result.error));
  }

  const {email, verificationCode, newPassword} = result.data;

  const existingUser = await UserRepository.findUserByEmail(email);
  
  if(!existingUser){
    throw new ApiError(404, "User not exist with this email");
  }
  if(existingUser.verification_code != verificationCode){
    throw new ApiError(400, "Invalid verification code");
  }
  if(!existingUser.verification_code_expiry || existingUser.verification_code_expiry.getTime() < Date.now()){
    throw new ApiError(400, "Verification code expired");
  }

  const hashedPassword = await hashedPasswords(newPassword);

  await UserRepository.updateUserById(String(existingUser._id),{
      password: hashedPassword,
      verification_code: undefined,
      verification_code_expiry: undefined,
  })

  res.status(200).json(
  new ApiResponse({
    message: "Password reset successful"
    })
  );  
});

export const LogoutUser = asyncHandler(async (req, res) => {
  const refresh_token = req.cookies.refresh_token;
  const session = await SessionRepository.findSessionByToken(refresh_token);

  if (refresh_token && session) {
     await SessionRepository.deleteSessionById(String(session._id));
  }

  res.clearCookie('refresh_token');
  res.clearCookie('access_token');

  res.status(200).json(new ApiResponse({
    message : "Loged out successfully"
  }));
});
