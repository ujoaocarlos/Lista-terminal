import java.util.Scanner;

import service.GerenciadorTarefas;

public class Main {

    public static void main(String[] args) {

        Scanner teclado = new Scanner(System.in);

        GerenciadorTarefas gerenciador = new GerenciadorTarefas();

        int opcao;

        do {

            mostrarMenu();

            opcao = lerInteiro(teclado, "Escolha uma opção: ");

            switch (opcao) {

                case 1:
                    adicionarTarefa(teclado, gerenciador);
                    break;

                case 2:
                    gerenciador.listar();
                    break;

                case 3:
                    concluirTarefa(teclado, gerenciador);
                    break;

                case 4:
                    desconcluirTarefa(teclado, gerenciador);
                    break;

                case 5:
                    editarTarefa(teclado, gerenciador);
                    break;

                case 6:
                    removerTarefa(teclado, gerenciador);
                    break;

                case 7:
                    buscarTarefa(teclado, gerenciador);
                    break;

                case 8:
                    gerenciador.limparConcluidas();
                    System.out.println("Tarefas concluídas removidas.");
                    break;

                case 9:
                    mostrarEstatisticas(gerenciador);
                    break;

                case 0:
                    System.out.println("\nPrograma encerrado!");
                    break;

                default:
                    System.out.println("Opção inválida!");
            }

        } while (opcao != 0);

        teclado.close();
    }

    private static void mostrarMenu() {

        System.out.println("\n==============================");
        System.out.println("       LISTA DE TAREFAS");
        System.out.println("==============================");
        System.out.println("1 - Adicionar tarefa");
        System.out.println("2 - Listar tarefas");
        System.out.println("3 - Concluir tarefa");
        System.out.println("4 - Desmarcar conclusão");
        System.out.println("5 - Editar tarefa");
        System.out.println("6 - Remover tarefa");
        System.out.println("7 - Buscar tarefa");
        System.out.println("8 - Limpar concluídas");
        System.out.println("9 - Estatísticas");
        System.out.println("0 - Sair");
        System.out.println("==============================");
    }

    private static void adicionarTarefa(
            Scanner teclado,
            GerenciadorTarefas gerenciador) {

        System.out.print("Digite a tarefa: ");

        String descricao = teclado.nextLine();

        if (descricao.trim().isEmpty()) {

            System.out.println("A tarefa não pode estar vazia.");

            return;
        }

        gerenciador.adicionar(descricao);

        System.out.println("Tarefa adicionada!");
    }

    private static void concluirTarefa(
            Scanner teclado,
            GerenciadorTarefas gerenciador) {

        int indice = lerInteiro(teclado, "Número da tarefa: ");

        if (gerenciador.concluir(indice)) {

            System.out.println("Tarefa concluída!");

        } else {

            System.out.println("Número inválido.");
        }
    }

    private static void desconcluirTarefa(
            Scanner teclado,
            GerenciadorTarefas gerenciador) {

        int indice = lerInteiro(teclado, "Número da tarefa: ");

        if (gerenciador.desconcluir(indice)) {

            System.out.println("Tarefa marcada como pendente!");

        } else {

            System.out.println("Número inválido.");
        }
    }

    private static void editarTarefa(
            Scanner teclado,
            GerenciadorTarefas gerenciador) {

        int indice = lerInteiro(teclado, "Número da tarefa: ");

        System.out.print("Nova descrição: ");

        String descricao = teclado.nextLine();

        if (descricao.trim().isEmpty()) {

            System.out.println("A descrição não pode estar vazia.");

            return;
        }

        if (gerenciador.editar(indice, descricao)) {

            System.out.println("Tarefa editada!");

        } else {

            System.out.println("Número inválido.");
        }
    }

    private static void removerTarefa(
            Scanner teclado,
            GerenciadorTarefas gerenciador) {

        int indice = lerInteiro(teclado, "Número da tarefa: ");

        if (gerenciador.remover(indice)) {

            System.out.println("Tarefa removida!");

        } else {

            System.out.println("Número inválido.");
        }
    }

    private static void buscarTarefa(
            Scanner teclado,
            GerenciadorTarefas gerenciador) {

        System.out.print("Digite o texto para buscar: ");

        String texto = teclado.nextLine();

        gerenciador.buscar(texto);
    }

    private static void mostrarEstatisticas(
            GerenciadorTarefas gerenciador) {

        System.out.println("\n--- ESTATÍSTICAS ---");

        System.out.println(
                "Total: " + gerenciador.quantidadeTotal());

        System.out.println(
                "Concluídas: " + gerenciador.quantidadeConcluidas());

        System.out.println(
                "Pendentes: " + gerenciador.quantidadePendentes());
    }

    private static int lerInteiro(
            Scanner teclado,
            String mensagem) {

        while (true) {

            System.out.print(mensagem);

            try {

                return Integer.parseInt(teclado.nextLine());

            } catch (NumberFormatException e) {

                System.out.println(
                        "Digite apenas um número.");
            }
        }
    }
}