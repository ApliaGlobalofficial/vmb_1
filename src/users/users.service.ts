import {
  Injectable,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole, LoginStatus, EditRequestStatus } from './entities/users.entity';
import { JwtService } from '@nestjs/jwt';
import * as nodemailer from 'nodemailer';
import { S3Service } from './s3.service';
import { InternalServerErrorException } from '@nestjs/common';


@Injectable()

export class UsersService {
  // s3Service: any;
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly s3Service: S3Service
  ) { }


  async updateUserStatus(userId: number, status: 'Active' | 'Inactive'): Promise<string> {
    const user = await this.userRepository.findOne({ where: { user_id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update status for any role
    user.user_login_status = status as LoginStatus;
    await this.userRepository.save(user);

    // Send email notification for status update
    await this.sendStatusUpdateEmail(user, status);

    return `User status updated to ${status}`;
  }

  // 🚀 Send Email Notification for Status Update
  async sendStatusUpdateEmail(user: User, status: 'Active' | 'Inactive'): Promise<void> {
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'rutujadeshmukh175@gmail.com', // Your email
        pass: 'wrbc dwbq ittr lyqa', // Your email app password
      },
    });

    let mailOptions = {
      from: 'rutujadeshmukh175@gmail.com',
      to: user.email,
      subject: 'Account Status Update',
      text: `Dear ${user.name},

Your account status has been updated to: ${status}.

${status === 'Active' ? 'You can now log in and access your account.' : 'Please contact support for further details.'}

Best regards,  
Aaradhya Cyber`,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`Status update email sent to ${user.email}`);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }



  // 🚀 Fetch All Distributors
  async getDistributors(): Promise<User[]> {
    return await this.userRepository.find({
      where: { role: UserRole.DISTRIBUTOR },
    });
  }

  async getCustomers(): Promise<User[]> {
    return await this.userRepository.find({
      where: { role: UserRole.CUSTOMER },
    });
  }
  async getEmployee(): Promise<User[]> {
    return await this.userRepository.find({
      where: { role: UserRole.EMPLOYEE },
    });
  }

  // 🚀 Fetch All Registered Users
  async getRegisteredUsers(): Promise<User[]> {
    return await this.userRepository.find();
  }

  // 🚀 Update Password Without Hashing
  async updatePassword(userId: number, newPassword: string): Promise<string> {
    const user = await this.userRepository.findOne({ where: { user_id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.password = newPassword; // 🚨 Saves plain text password (Not Secure)
    await this.userRepository.save(user);

    // Send Email Notification
    await this.sendPasswordUpdateEmail(user, newPassword);

    return 'Password updated successfully, and email notification sent.';
  }
  async sendPasswordUpdateEmail(user: User, newPassword: string): Promise<void> {
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'rutujadeshmukh175@gmail.com', // Your email
        pass: 'wrbc dwbq ittr lyqa', // Your email app password
      },
    });

    let mailOptions = {
      from: 'rutujadeshmukh175@gmail.com',
      to: user.email,
      subject: 'Your Password Has Been Updated',
      text: `Dear ${user.name},

Your password has been successfully updated.

Username:${user.email}
New Password: ${newPassword}  

For security reasons, please do not share this password with anyone.

Best regards,  
Aaradhya Cyber`,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`Password update email sent to ${user.email}`);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }


  // // 🚀 Edit User Details
  // async editUser(userId: number, updateData: Partial<User>): Promise<User> {
  //   const user = await this.userRepository.findOne({ where: { user_id: userId } });
  //   if (!user) throw new NotFoundException('User not found');

  //   await this.userRepository.update(userId, updateData);
  //   const updatedUser = await this.userRepository.findOne({ where: { user_id: userId } });
  //   if (!updatedUser) {
  //     throw new NotFoundException('User not found');
  //   }
  //   return updatedUser;
  // }
  async editUser(
    userId: number,
    updateData: Partial<User>,
    files: Express.Multer.File[] = [],
  ): Promise<User> {
    // 1) load existing user
    const user = await this.userRepository.findOne({ where: { user_id: userId } });
    if (!user) throw new NotFoundException('User not found');

    if (files.length) {
      // 2) delete old documents from S3 (if any)
      if (Array.isArray(user.user_documents) && user.user_documents.length) {
        await Promise.all(
          user.user_documents.map(doc =>
            // assumes you have a deleteFile(urlOrKey) method on your s3Service
            this.s3Service.deleteFile(doc.file_path),
          ),
        );
      }

      // 3) upload each new file
      const uploadedDocs = await Promise.all(
        files.map(async file => ({
          document_type: file.originalname,
          mimetype: file.mimetype,
          // will return your URL string
          file_path: await this.s3Service.uploadFile(file),
        })),
      );

      // 4) replace the old array entirely
      updateData.user_documents = uploadedDocs;
    }

    // 5) merge in any other fields
    Object.assign(user, updateData);

    // 6) persist & return
    return this.userRepository.save(user);
  }

  // 🚀 Delete User
  async deleteUser(userId: number): Promise<string> {
    const result = await this.userRepository.delete(userId);
    if (result.affected === 0) throw new NotFoundException('User not found');
    return 'User deleted successfully';
  }

  // 🚀 Get User by ID
  async getUserById(userId: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { user_id: Number(userId) } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  // 🚀 Send Email on Registration
  async sendRegistrationEmail(user: User, originalPassword: string): Promise<void> {
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'rutujadeshmukh175@gmail.com', // Your email
        pass: 'wrbc dwbq ittr lyqa', // Your email password
      },
    });

    let mailOptions = {
      from: 'rutujadeshmukh175@gmail.com',
      to: user.email,
      subject: 'Registration Successful - Your Login Credentials',
      text: `Dear ${user.name},

You have successfully registered.

Your Username: ${user.email}
Your Password: ${originalPassword}  

Please keep this information secure.

Best regards,
Aaradhya Cyber`,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`Registration email sent to ${user.email}`);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }



  async register(
    data: Partial<User & { district: string; taluka: string }>,
    files: Express.Multer.File[],
    documentTypes: string[],
    profilePhoto?: Express.Multer.File,
  ): Promise<User> {
    const originalPassword = data.password ?? '';

    if (!data.role) {
      throw new BadRequestException('Role is required');
    }

    const newUser = this.userRepository.create({
      ...data,
      district: data.district,
      taluka: data.taluka,
      user_login_status: LoginStatus.INACTIVE,
    });

    if (profilePhoto) {
      const profilePhotoUrl = await this.s3Service.uploadFile(profilePhoto);
      newUser.profile_picture = profilePhotoUrl;
    }

    if (files?.length) {
      const uploadedDocuments = await Promise.all(
        files.map(async (file, idx) => ({
          document_type: documentTypes[idx] || 'Unknown',
          mimetype: file.mimetype,
          file_path: await this.s3Service.uploadFile(file),
        })),
      );
      newUser.user_documents = uploadedDocuments;
    }

    let savedUser: User;
    try {
      savedUser = await this.userRepository.save(newUser);
    } catch (err: any) {
      const code =
        err.code || err.errno || err.driverError?.code || err.driverError?.errno;

      if (code === 'ER_DUP_ENTRY' || code === 1062 || code === '23505') {
        throw new ConflictException('That email is already registered');
      }

      throw new InternalServerErrorException('Unexpected error saving user');
    }

    await this.sendRegistrationEmail(savedUser, originalPassword);
    return savedUser;
  }


  // ✅ User login with JWT token containing all user data
  async login(email: string, password: string): Promise<{ token: string; role: UserRole }> {
    const user = await this.userRepository.findOne({ where: { email, password } });

    if (!user) throw new NotFoundException('Invalid email or password');

    // Check if user login status is "Active"
    if (user.user_login_status !== "Active") {
      throw new UnauthorizedException('Wait for Admin Verification');
    }

    // JWT Payload
    const payload = {
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      shop_address: user.shop_address,
      role: user.role,
      user_login_status: user.user_login_status,
      created_at: user.created_at,
      profile_picture: user.profile_picture ?? null, // ✅ added
      user_documents: user.user_documents ?? [],
    };

    const token = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '1h',
    });

    return { token, role: user.role };
  }


  async getUserId(userId: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { user_id: userId }
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  // src/users/users.service.ts
  async updateUserWithDocuments(
    userId: number,
    body: any,
    files: Express.Multer.File[],
    documentTypes: string[],
  ) {
    // 1) load
    const user = await this.userRepository.findOne({ where: { user_id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // 2) pull out documentTypes, leave the rest
    const { documentTypes: _dt, ...rest } = body;

    // 3) normalize shop address from either key
    const shopAddr = rest.shopAddress ?? rest.shop_address;

    // 4) build update payload,
    //    copying all other keys 1:1, but forcing shop_address + login status
    const toUpdate: Record<string, any> = {
      ...rest,                      // name, email, phone, address, district, taluka, etc.
      shop_address: shopAddr,       // always write to the snake_case column
      user_login_status: LoginStatus.INACTIVE,
    };

    // 5) merge & save
    this.userRepository.merge(user, toUpdate);

    // 6) file logic (unchanged)
    if (files.length) {
      const updatedDocs = Array.isArray(user.user_documents)
        ? [...user.user_documents]
        : [];

      await Promise.all(files.map(async (file, idx) => {
        const type = documentTypes[idx];
        if (!type) throw new BadRequestException(`Missing documentType at index ${idx}`);

        const old = updatedDocs.find(d => d.document_type === type);
        if (old) await this.s3Service.deleteFile(old.file_path);

        const url = await this.s3Service.uploadFile(file);
        const entry = {
          document_type: type,
          mimetype: file.mimetype,
          file_path: url,
        };

        const i = updatedDocs.findIndex(d => d.document_type === type);
        if (i > -1) updatedDocs[i] = entry;
      }));

      user.user_documents = updatedDocs;
    }

    await this.userRepository.save(user);
    return { message: 'User updated successfully', user };
  }



  async requestProfileEdit(userId: number): Promise<string> {
    const user = await this.userRepository.findOne({ where: { user_id: userId } });
    if (!user) throw new NotFoundException('User not found');

    user.edit_request_status = EditRequestStatus.PENDING;
    await this.userRepository.save(user);

    const admin = await this.userRepository.findOne({ where: { role: UserRole.ADMIN } });
    if (!admin) throw new NotFoundException('Admin user not found');
    await this.sendEditRequestNotification(admin, user);

    return 'Edit request submitted. The admin has been notified.';
  }

  /**
   * 2️⃣ Admin approves or rejects the pending request.
   *    - Sets edit_request_status = Approved or Rejected
   *    - Emails the User the result
   */
  async resolveProfileEditRequest(
    userId: number,
    status: EditRequestStatus.APPROVED | EditRequestStatus.REJECTED
  ): Promise<string> {
    const user = await this.userRepository.findOne({ where: { user_id: userId } });
    if (!user) throw new NotFoundException('User not found');

    user.edit_request_status = status;
    await this.userRepository.save(user);

    await this.sendEditRequestResultEmail(user, status);
    return `Edit request has been ${status.toLowerCase()}.`;
  }

  /** Email the admin when a user requests an edit */
  private async sendEditRequestNotification(admin: User, user: User) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'rutujadeshmukh175@gmail.com',
        pass: 'wrbc dwbq ittr lyqa',
      },
    });

    const mailOptions = {
      from: 'rutujadeshmukh175@gmail.com',
      replyTo: `${user.name} <${user.email}>`,
      to: admin.email,
      subject: `🔔 Profile Edit Requested by ${user.name}`,
      text: `
Hello ${admin.name},

User ${user.name} <${user.email}> has requested to edit their profile.

Please review their request and either approve or reject:

  • Approve:  
  • Reject:   

Best regards,
Aaradhya Cyber
      `.trim(),
    };

    await transporter.sendMail(mailOptions);
  }

  /** Email the user after the Admin approves or rejects */
  private async sendEditRequestResultEmail(
    user: User,
    status: EditRequestStatus
  ) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'rutujadeshmukh175@gmail.com',
        pass: 'wrbc dwbq ittr lyqa',
      },
    });

    const mailOptions = {
      from: 'rutujadeshmukh175@gmail.com',
      to: user.email,
      subject: status === EditRequestStatus.APPROVED
        ? '✅ Your profile edit request has been approved'
        : '❌ Your profile edit request was rejected',
      text: status === EditRequestStatus.APPROVED
        ? `
Dear ${user.name},

Your request to edit your profile has been approved! You may now log in and update your details at any time.

Best regards,
Aaradhya Cyber
        `.trim()
        : `
Dear ${user.name},

We’re sorry, but your request to edit your profile has been rejected. If you have any questions, please contact support.

Best regards,
Aaradhya Cyber
        `.trim(),
    };

    await transporter.sendMail(mailOptions);
  }



  async forgotPassword(email: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new NotFoundException('User not found');

    // — generate a simple random token —
    const resetToken =
      Date.now().toString(36) +
      Math.random().toString(36).substring(2);
    user.resetToken = resetToken;
    user.resetTokenExpiration = new Date(Date.now() + 3600_000); // +1h
    await this.userRepository.save(user);

    // — build your reset link —
    const frontUrl = 'https://mazedakhale.in/api';  // or your real front URL
    const link = `${frontUrl}/reset-password?token=${resetToken}`;

    // — inline Gmail transporter —
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'rutujadeshmukh175@gmail.com',
        pass: 'wrbc dwbq ittr lyqa',
      },
    });

    await transporter.sendMail({
      from: 'rutujadeshmukh175@gmail.com',
      to: user.email,
      subject: '🔒 Password Reset Link',
      text: `
Hello ${user.name},

You requested to reset your password. Click the link below to choose a new one:

${link}

This link expires in one hour. If you didn’t request this, please ignore this email.
      `.trim(),
    });
  }

  /**
   * 2️⃣ Accept the token + new passwords,
   *     verify, then save the plain-text password
   */
  async resetPassword(
    token: string,
    newPassword: string,
    confirmPassword: string,
  ): Promise<string> {
    if (newPassword !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const user = await this.userRepository.findOne({ where: { resetToken: token } });
    if (!user) throw new NotFoundException('Invalid reset token');

    if (!user.resetTokenExpiration || user.resetTokenExpiration < new Date()) {
      throw new UnauthorizedException('Reset token expired');
    }

    // — save new password in plain text —
    user.password = newPassword;
    user.resetToken = null;
    user.resetTokenExpiration = null;
    await this.userRepository.save(user);

    // — reuse your existing password-update email —
    await this.sendPasswordUpdateEmail(user, newPassword);

    return 'Password reset successful; check your email.';
  }

  // your existing sendPasswordUpdateEmail() method
  async sendPasswordResetEmail(user: User, newPassword: string): Promise<void> {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'rutujadeshmukh175@gmail.com',
        pass: 'wrbc dwbq ittr lyqa',
      },
    });

    const mailOptions = {
      from: 'rutujadeshmukh175@gmail.com',
      to: user.email,
      subject: 'Your Password Has Been Updated',
      text: `Dear ${user.name},

Your password has been successfully updated.

Username: ${user.email}
New Password: ${newPassword}

For security reasons, please do not share this password with anyone.

Best regards,
Aaradhya Cyber`,
    };

    await transporter.sendMail(mailOptions);
  }
}



