import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailModule } from '../mail/mail.module';
import { UsersModule } from '../users/users.module';
import { TaskAssignee } from './entities/task-assignee.entity';
import { TaskComment } from './entities/task-comment.entity';
import { TaskStatusHistory } from './entities/task-status-history.entity';
import { Task } from './entities/task.entity';
import { TaskCommentsController } from './task-comments.controller';
import { TaskCommentsService } from './task-comments.service';
import { TaskHistoryController } from './task-history.controller';
import { TaskHistoryService } from './task-history.service';
import { TaskWorkflowService } from './task-workflow.service';
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
