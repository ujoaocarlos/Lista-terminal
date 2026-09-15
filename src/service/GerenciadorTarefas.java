package service;

import java.util.ArrayList;
import model.Tarefa;

public class GerenciadorTarefas {

    private ArrayList<Tarefa> tarefas;

    public GerenciadorTarefas() {
        tarefas = new ArrayList<>();
    }

    public void adicionar(String descricao) {

        Tarefa tarefa = new Tarefa(descricao);

        tarefas.add(tarefa);
    }

    public void listar() {

        if (tarefas.isEmpty()) {
            System.out.println("Nenhuma tarefa cadastrada.");
            return;
        }

        System.out.println("\n--- SUAS TAREFAS ---");

        for (int i = 0; i < tarefas.size(); i++) {

            System.out.println((i + 1) + " - " + tarefas.get(i));
        }
    }

    public boolean concluir(int indice) {

        if (!indiceValido(indice)) {
            return false;
        }

        tarefas.get(indice - 1).concluir();

        return true;
    }

    public boolean desconcluir(int indice) {

        if (!indiceValido(indice)) {
            return false;
        }

        tarefas.get(indice - 1).desconcluir();

        return true;
    }

    public boolean remover(int indice) {

        if (!indiceValido(indice)) {
            return false;
        }

        tarefas.remove(indice - 1);

        return true;
    }

    public boolean editar(int indice, String novaDescricao) {

        if (!indiceValido(indice)) {
            return false;
        }

        tarefas.get(indice - 1).setDescricao(novaDescricao);

        return true;
    }

    public void buscar(String texto) {

        boolean encontrou = false;

        System.out.println("\n--- RESULTADO DA BUSCA ---");

        for (int i = 0; i < tarefas.size(); i++) {

            Tarefa tarefa = tarefas.get(i);

            if (tarefa.getDescricao()
                    .toLowerCase()
                    .contains(texto.toLowerCase())) {

                System.out.println((i + 1) + " - " + tarefa);

                encontrou = true;
            }
        }

        if (!encontrou) {
            System.out.println("Nenhuma tarefa encontrada.");
        }
    }

    public void limparConcluidas() {

        tarefas.removeIf(Tarefa::isConcluida);
    }

    public int quantidadeTotal() {
        return tarefas.size();
    }

    public int quantidadeConcluidas() {

        int quantidade = 0;

        for (Tarefa tarefa : tarefas) {

            if (tarefa.isConcluida()) {
                quantidade++;
            }
        }

        return quantidade;
    }

    public int quantidadePendentes() {

        return quantidadeTotal() - quantidadeConcluidas();
    }

    private boolean indiceValido(int indice) {

        return indice > 0 && indice <= tarefas.size();
    }
}