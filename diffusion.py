import torch
import torch.nn as nn
import torch.optim as optim
from model import Model
import os
from tqdm.auto import tqdm

from data import load_dataset_and_make_dataloaders

def sample_sigma(n, loc=-1.2, scale=1.2, sigma_min=2e-3, sigma_max=80, device=None):
    return (torch.randn(n, device=device) * scale + loc).exp().clip(sigma_min, sigma_max)

def build_sigma_schedule(steps, rho=7, sigma_min=2e-3, sigma_max=80):
    min_inv_rho = sigma_min ** (1 / rho)
    max_inv_rho = sigma_max ** (1 / rho)
    sigmas = (max_inv_rho + torch.linspace(0, 1, steps) * (min_inv_rho - max_inv_rho)) ** rho
    return sigmas

def c_in(sigma, sigma_data):
    return 1 / (sigma**2 + sigma_data**2)**0.5

def c_out(sigma, sigma_data):
    return (sigma * sigma_data) / (sigma**2 + sigma_data**2)**0.5

def c_skip(sigma, sigma_data):
    return sigma_data**2 / (sigma**2 + sigma_data**2)

def c_noise(sigma):
    return torch.log(sigma)/4

if __name__ == "__main__":

    gpu = torch.cuda.is_available()
    device = torch.device('cuda:0' if gpu else 'cpu')
    
    dl, info = load_dataset_and_make_dataloaders(
        dataset_name='FashionMNIST',
        root_dir='data', # choose the directory to store the data 
        batch_size=512,
        num_workers=16,
        pin_memory=gpu,
    )

    nb_epochs = 100

    assert not os.path.exists(f'model_{nb_epochs}.pth'), "Model already exists. Please remove it or change the number of epochs."

    model = Model(image_channels=info.image_channels, nb_channels=64, num_blocks=4, cond_channels=0)
    criterion = nn.MSELoss()
    optimizer = optim.Adam(model.parameters(), lr=1e-3)

    criterion.to(device)
    model.to(device)
    sigma_data = info.sigma_data.to(device)

    list_losses = torch.zeros(nb_epochs, device=device)

    for epoch in tqdm(range(nb_epochs), desc="Epochs"):
        epoch_loss = torch.zeros((), device=device)
        image_count = 0
        batches = tqdm(dl.train, desc=f"Epoch {epoch + 1}/{nb_epochs}", leave=False)
        for y, _ in batches:
            y = y.to(device, non_blocking=True)
            # One random noise level per image; the 50-step schedule is for generation.
            sigma = sample_sigma(y.shape[0], device=device)
            sigma_image = sigma.view(-1, 1, 1, 1)
            x = y + torch.randn_like(y) * sigma_image
            cin = c_in(sigma_image, sigma_data)
            cout = c_out(sigma_image, sigma_data)
            cskip = c_skip(sigma_image, sigma_data)
            cnoise = c_noise(sigma)

            model.zero_grad()
            x_pred = model(x * cin, cnoise)
            loss = criterion(x_pred, (y - cskip * x) / cout)
            loss.backward()
            optimizer.step()
            # Keep accumulation on the GPU; transfer one scalar per epoch.
            epoch_loss += loss.detach() * y.shape[0]
            image_count += y.shape[0]

        list_losses[epoch] = epoch_loss / image_count
        tqdm.write(f"Epoch {epoch + 1}: mean loss = {list_losses[epoch].item():.5f}")
    torch.save(model, f'model_{nb_epochs}.pth')
