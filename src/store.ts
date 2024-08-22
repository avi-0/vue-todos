import { computed, onScopeDispose, ref, watch, type Ref } from 'vue'
import Pocketbase, { type AuthModel } from 'pocketbase'
import { taskBeenPending, taskCompleted, taskRepeatsIn, type Task, type TasksStore } from './tasks'
import {
  compareBooleans,
  compareBy,
  compareIfDefined,
  compareNumbers,
  compareOrdered,
  compareStrings,
  invert
} from './sort'
import { useNow } from '@vueuse/core'

type TaskRecord = {
  id: string
  description: string
  completed: boolean
  repeatEnabled: boolean
  cooldownSeconds: number
  lastCompleted: string
  created: string
}

const taskFromRecord = (record: TaskRecord): Task => ({
  ...record,
  lastCompleted: new Date(record.lastCompleted || 0),
  created: new Date(record.created)
})

const recordFromTask = (task: Task): TaskRecord => ({
  ...task,
  lastCompleted: task.lastCompleted.toISOString(),
  created: task.created.toISOString()
})

export type PBConnection = {
  pb: Pocketbase
  user: Ref<AuthModel>
  signInWithGoogle: () => void
  logOut: () => void
}

export function createPBConnection(): PBConnection {
  const pb = new Pocketbase('https://pb.cutekittenindustries.org')
  pb.autoCancellation(false)

  const user = ref(pb.authStore.model)

  onScopeDispose(
    pb.authStore.onChange((_, model) => {
      user.value = model
    })
  )

  const signInWithGoogle = () => pb.collection('users').authWithOAuth2({ provider: 'google' })

  const logOut = () => pb.authStore.clear()

  return {
    pb,
    user,
    signInWithGoogle,
    logOut
  }
}

export function createTasksStore(conn: PBConnection): TasksStore {
  const tasks = ref<Task[]>([])

  const update = (records: TaskRecord[]) => {
    tasks.value = records.map(taskFromRecord)
  }

  const fetchAll = async () => {
    const records = (await conn.pb.collection('tasks').getFullList({
      sort: '-created'
    })) as TaskRecord[]

    update(records)
  }

  // conn.pb.collection('tasks').subscribe('*', (e) => {
  //   const record = e.record as unknown as TaskRecord
  //   const task = taskFromRecord(record)

  //   const existingTaskI = tasks.value.findIndex((t) => t.id == task.id)
  //   if (existingTaskI >= 0) {
  //     if (e.action == 'delete') {
  //       tasks.value.splice(existingTaskI, 1)
  //     } else {
  //       tasks.value[existingTaskI] = task
  //     }
  //   } else {
  //     tasks.value.push(task)
  //   }
  // })

  watch(
    conn.user,
    () => {
      fetchAll()
    },
    { immediate: true }
  )

  const now = useNow()

  const sortedTasks = computed(() => {
    return tasks.value.toSorted(
      compareOrdered([
        compareBy((task) => taskCompleted(task, now.value), compareBooleans),
        compareBy(
          (task) => taskBeenPending(task, now.value),
          compareIfDefined(compareNumbers, { undefinedIsLarger: true })
        ),
        compareBy(
          (task) => taskRepeatsIn(task, now.value),
          compareIfDefined(compareNumbers, { undefinedIsLarger: true })
        ),
        compareBy((task) => task.created.toISOString(), invert(compareStrings)),
        compareBy((task) => task.id, compareStrings)
      ])
    )
  })

  const store = {
    tasks: sortedTasks,
    create: async (task: Partial<Task>) => {
      await conn.pb.collection('tasks').create({ ...task, user: conn.user.value!.id })
      fetchAll()
    },
    update: async (task: Task) => {
      // update locally immediately
      tasks.value = tasks.value.map((task_) => {
        if (task_.id == task.id) {
          return task
        }
        return task_
      })

      await conn.pb.collection('tasks').update(task.id, recordFromTask(task))
      fetchAll()
    },
    delete: async (task: Task) => {
      await conn.pb.collection('tasks').delete(task.id)
      fetchAll()
    }
  }

  return store
}
