package model;

public class Tarefa {

    private String descricao;
    private boolean concluida;

    public Tarefa(String descricao) {
        this.descricao = descricao;
        this.concluida = false;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public boolean isConcluida() {
        return concluida;
    }

    public void concluir() {
        concluida = true;
    }

    public void desconcluir() {
        concluida = false;
    }

    @Override
    public String toString() {

        if (concluida) {
            return "[X] " + descricao;
        }

        return "[ ] " + descricao;
    }
}