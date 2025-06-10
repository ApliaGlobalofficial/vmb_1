import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HttpModule } from '@nestjs/axios';           // ← add this
// Load environment variables early
import { config } from 'dotenv';
import { CategoriesModule } from './categories/categories.module';
import { SubcategoriesModule } from './subcategories/subcategories.module';
import { DocumentsModule } from './documents/documents.module';
import { CertificatesModule } from './certificates/certificates.module';
import { RequiredDocumentsModule } from './required-documents/required-documents.module';
import { DocumentType } from './document-types/entities/document-type/document-type.entity.';
import { DocumentTypesModule } from './document-types/document-types.module';
import { StatisticsModule } from './statistics/statistics.module';
import { FeildNamesModule } from './feild_names/feild_names.module';
import { UserDashboardModule } from './userdashboard/userdashboard.module';
import { DownloadModule } from './download/download.module';
import { SingleDocumentModule } from './singledocument/singledocument.module';
import { NotificationsModule } from './notifications/notifications.module';
import { RequestErrorsModule } from './request-errors/request-errors.module';
import { DownloadCertificateModule } from './download-certificate/download-certificate.module';
import { FeedbackModule } from './feedback/feedback.module';
import { FieldModule } from './feild/feild.module';
import { ContactModule } from './contact/contact.module';
import { PrivacyPolicyModule } from './privacy-policy/privacy-policy.module';
import { EmployeeModule } from './employee/employee.module';
import { ImageModule } from './image/image.module';
import { PricesModule } from './prices/prices.module';
import { NewsModule } from './news/news.module';
import { WalletModule } from './wallet/wallet.module';
import { RazorpayModule } from './razorpay/razorpay.module';
import { SmsModule } from './sms/sms.module';
import { HeaderModule } from './header/header.module';
import { ContactInfoModule } from './contact-info/contact-info.module';
import { WalletRequestModule } from './wallet_request/wallet_request.module';
import { WalletDebitModule } from './wallet_debit/wallet_debit.module';
import * as dotenvv from 'dotenv';

dotenvv.config();
config();
console.log('Environment Variables Loaded:', {
  DB_HOST: process.env.DB_HOST,})
 
@Module({
  imports: [

    ConfigModule.forRoot({
      isGlobal: true, // Makes the config available across the entire application
      envFilePath: ['.env', '.env.local'],
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: true,


    }),

    // 3) Register HttpModule so HttpService is injectable everywhere
    HttpModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        baseURL: cfg.get<string>('LIVEONE_BASE_URL'),
        headers: { 'Content-Type': 'application/json' },
      }),
    }),
    UsersModule,
    CategoriesModule,
    SubcategoriesModule,
    DocumentsModule,
    DocumentTypesModule,
    CertificatesModule,
    RequiredDocumentsModule,
    DocumentType,
    FeildNamesModule,
    StatisticsModule,
    UserDashboardModule,
    DownloadModule,
    SingleDocumentModule,
    NotificationsModule,
    RequestErrorsModule,
    DownloadCertificateModule,
    FeedbackModule,
    FieldModule,
    ContactModule,
    EmployeeModule,
    ImageModule,
    PricesModule,
    WalletModule,
    RazorpayModule,
    NewsModule,
    PricesModule,
    NewsModule,
    SmsModule,
    HeaderModule,
    ContactInfoModule,
    NewsModule
,
    PrivacyPolicyModule,
    WalletRequestModule,
    WalletDebitModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
