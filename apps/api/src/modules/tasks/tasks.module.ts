import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailModule } from '../mail/mail.module';
import { UsersModule } from '../users/users.module';
import { TaskAssignee } from './entities/taskAssignee.entity';
import { TaskComment } from './entities/taskComment.entity';
import { TaskStatusHistory } from './entities/taskStatusHistory.entity';
import { Task } from './entities/task.entity';
import { TaskCommentsController } from './taskComments.controller';
import { TaskCommentsService } from './taskComments.service';
import { TaskHistoryController } from './taskHistory.controller';
import { TaskHistoryService } from './taskHistory.service';
import { TaskWorkflowService } from './taskWorkflow.service';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, TaskAssignee, TaskComment, TaskStatusHistory]),
    UsersModule,
    MailModule,
  ],
  controllers: [TasksController, TaskCommentsController, TaskHistoryController],
  providers: [TasksService, TaskWorkflowService, TaskCommentsService, TaskHistoryService],
})
export class TasksModule {}
