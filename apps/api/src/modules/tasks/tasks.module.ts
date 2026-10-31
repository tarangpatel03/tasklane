import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { TaskAssignee } from './entities/task-assignee.entity';
import { TaskComment } from './entities/task-comment.entity';
import { TaskStatusHistory } from './entities/task-status-history.entity';
import { Task } from './entities/task.entity';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, TaskAssignee, TaskComment, TaskStatusHistory]),
    UsersModule,
  ],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
